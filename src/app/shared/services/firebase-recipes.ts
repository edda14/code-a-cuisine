import { Injectable } from '@angular/core';
import { signInAnonymously, User } from 'firebase/auth';
import { type QueryConstraint, type Query, type DocumentReference, type Transaction, addDoc, collection, getDocs, getDoc, limit, orderBy, query, serverTimestamp, doc, runTransaction, where, DocumentData, QueryDocumentSnapshot, startAfter, getCountFromServer } from 'firebase/firestore';
import { firebaseAuth, firestore } from './../../firebase-config';
import { GeneratedRecipe } from '../interfaces/generated-recipe';

export interface RecipePage {
  recipes: GeneratedRecipe[];
  lastDocument:
  QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}
export interface RecipeLikeResult {
  likeCount: number;
  hasLiked: boolean;
}
@Injectable({
  providedIn: 'root',
})

export class FirebaseRecipes {
  private readonly recipePageSize = 20;

  /**
   * Signs the visitor in anonymously when necessary.
   */
  private async getCurrentUser(): Promise<User> {
    if (firebaseAuth.currentUser) {
      return firebaseAuth.currentUser;
    }
    const credential = await signInAnonymously(firebaseAuth);
    return credential.user;
  }

  /**
   * Stores all generated recipes and returns their Firestore IDs.
   */
  async saveRecipes(recipes: GeneratedRecipe[]): Promise<string[]> {
    const user = await this.getCurrentUser();
    const documentReferences = await Promise.all(
      recipes.map((recipe) =>
        addDoc(collection(firestore, 'recipes'), {
          ...recipe,
          likes: 0,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        })
      )
    );
    return documentReferences.map(
      (documentReference) => documentReference.id
    );
  }

  /**
   * Loads the five most-liked recipes from Firestore.
   */
  async getMostLikedRecipes(): Promise<GeneratedRecipe[]> {
    const recipesQuery = query(
      collection(firestore, 'recipes'),
      orderBy('likes', 'desc'),
      limit(4)
    );
    const snapshot = await getDocs(recipesQuery);
    return snapshot.docs.map((document) => ({
      ...(document.data() as GeneratedRecipe),
      id: document.id,
    }));
  }

/**
 * Adds or removes the current user's recipe like.
 */
async toggleRecipeLike(
  recipeId: string
): Promise<RecipeLikeResult> {
  const user = await this.getCurrentUser();
  const recipeReference =
    doc(firestore, 'recipes', recipeId);
  const likeReference =
    doc(firestore, 'recipes', recipeId, 'likes', user.uid);
  return runTransaction(firestore, (transaction) =>
    this.updateLikeTransaction(
      transaction,
      recipeReference,
      likeReference
    )
  );
}

/**
 * Determines whether the current like should be added or removed.
 */
private async updateLikeTransaction(
  transaction: Transaction,
  recipeReference: DocumentReference,
  likeReference: DocumentReference
): Promise<RecipeLikeResult> {
  const recipeSnapshot =
    await transaction.get(recipeReference);
  const likeSnapshot =
    await transaction.get(likeReference);
  if (!recipeSnapshot.exists()) {
    throw new Error('Recipe does not exist.');
  }
  const likes = Number(recipeSnapshot.data()['likes'] ?? 0);
  return likeSnapshot.exists()
    ? this.removeLike(transaction, recipeReference, likeReference, likes)
    : this.addLike(transaction, recipeReference, likeReference, likes);
}

/**
 * Removes a user's like from a recipe.
 */
private removeLike(
  transaction: Transaction,
  recipeReference: DocumentReference,
  likeReference: DocumentReference,
  currentLikes: number
): RecipeLikeResult {
  const likeCount = Math.max(currentLikes - 1, 0);
  transaction.update(recipeReference, { likes: likeCount });
  transaction.delete(likeReference);
  return { likeCount, hasLiked: false };
}

/**
 * Adds a user's like to a recipe.
 */
private addLike(
  transaction: Transaction,
  recipeReference: DocumentReference,
  likeReference: DocumentReference,
  currentLikes: number
): RecipeLikeResult {
  const likeCount = currentLikes + 1;
  transaction.update(recipeReference, { likes: likeCount });
  transaction.set(likeReference, {
    createdAt: serverTimestamp(),
  });
  return { likeCount, hasLiked: true };
}

  /**
   * Checks whether the current user has liked a recipe.
   */
  async hasLikedRecipe(recipeId: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    const likeReference = doc(
      firestore,
      'recipes',
      recipeId,
      'likes',
      user.uid
    );
    const likeSnapshot = await getDoc(likeReference);
    return likeSnapshot.exists();
  }

/**
 * Loads one page of recipes for the selected cuisine.
 */
async getRecipesByCuisine(
  cuisine: string,
  lastDocument:
    QueryDocumentSnapshot<DocumentData> | null = null
): Promise<RecipePage> {
  const recipesQuery =
    this.createCuisineQuery(cuisine, lastDocument);
  const snapshot = await getDocs(recipesQuery);
  return this.createRecipePage(snapshot.docs);
}

/**
 * Creates a Firestore query for one cuisine page.
 */
private createCuisineQuery(
  cuisine: string,
  lastDocument:
    QueryDocumentSnapshot<DocumentData> | null
): Query<DocumentData> {
  const recipes = collection(firestore, 'recipes');
  const constraints: QueryConstraint[] = [
    where('cuisine', '==', cuisine),
    limit(this.recipePageSize + 1),
  ];
  if (lastDocument) {
    constraints.splice(1, 0, startAfter(lastDocument));
  }
  return query(recipes, ...constraints);
}

/**
 * Converts Firestore documents into a recipe page.
 */
private createRecipePage(
  documents: QueryDocumentSnapshot<DocumentData>[]
): RecipePage {
  const hasMore =
    documents.length > this.recipePageSize;
  const visibleDocuments =
    documents.slice(0, this.recipePageSize);
  const recipes = visibleDocuments.map((document) => ({
    ...(document.data() as GeneratedRecipe),
    id: document.id,
  }));
  return {
    recipes,
    lastDocument:
      visibleDocuments[visibleDocuments.length - 1] ?? null,
    hasMore,
  };
}

  /**
 * Returns the number of saved recipes for one cuisine.
 */
  async getRecipeCountByCuisine(cuisine: string): Promise<number> {
    const recipesQuery = query(
      collection(firestore, 'recipes'),
      where('cuisine', '==', cuisine)
    );
    const snapshot = await getCountFromServer(recipesQuery);
    return snapshot.data().count;
  }
}
