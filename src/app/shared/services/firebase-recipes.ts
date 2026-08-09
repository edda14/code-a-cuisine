import { Injectable } from '@angular/core';
import { signInAnonymously, User } from 'firebase/auth';
import {
    addDoc,
    collection,
    getDocs,
    getDoc,
    limit,
    orderBy,
    query,
    serverTimestamp,
    doc,
runTransaction,
} from 'firebase/firestore';
import {
    firebaseAuth,
    firestore,
} from './../../firebase-config';
import { GeneratedRecipe } from '../interfaces/generated-recipe';

@Injectable({
    providedIn: 'root',
})
export class FirebaseRecipes {
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
 * Loads the ten most-liked recipes from Firestore.
 */
    async getMostLikedRecipes(): Promise<GeneratedRecipe[]> {
        const recipesQuery = query(
            collection(firestore, 'recipes'),
            orderBy('likes', 'desc'),
            limit(10)
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
): Promise<{ likeCount: number; hasLiked: boolean }> {
  const user = await this.getCurrentUser();

  const recipeReference = doc(
    firestore,
    'recipes',
    recipeId
  );

  const likeReference = doc(
    firestore,
    'recipes',
    recipeId,
    'likes',
    user.uid
  );

  return runTransaction(firestore, async (transaction) => {
    const recipeSnapshot =
      await transaction.get(recipeReference);

    const likeSnapshot =
      await transaction.get(likeReference);

    if (!recipeSnapshot.exists()) {
      throw new Error('Recipe does not exist.');
    }

    const currentLikes =
      Number(recipeSnapshot.data()['likes'] ?? 0);

    if (likeSnapshot.exists()) {
      const newLikeCount = Math.max(currentLikes - 1, 0);

      transaction.update(recipeReference, {
        likes: newLikeCount,
      });

      transaction.delete(likeReference);

      return {
        likeCount: newLikeCount,
        hasLiked: false,
      };
    }

    const newLikeCount = currentLikes + 1;

    transaction.update(recipeReference, {
      likes: newLikeCount,
    });

    transaction.set(likeReference, {
      createdAt: serverTimestamp(),
    });

    return {
      likeCount: newLikeCount,
      hasLiked: true,
    };
  });
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
}