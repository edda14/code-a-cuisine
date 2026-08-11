import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GeneratedRecipe } from '../../shared/interfaces/generated-recipe';
import { FirebaseRecipes, RecipePage } from '../../shared/services/firebase-recipes';
import { RecipeData } from '../../shared/services/recipe-data';

interface CuisineHeader {
  title: string;
  image: string;
}

@Component({
  selector: 'app-categorie',
  imports: [RouterLink],
  templateUrl: './categorie.html',
  styleUrl: './categorie.scss',
})
export class Categorie implements OnInit {
  cuisine = '';
  cuisineTitle = '';
  headerImage = '';
  recipes = signal<GeneratedRecipe[]>([]);
  isLoading = signal(true);
  hasLoadingError = signal(false);
  isLoadingMore = signal(false);
  currentPage = signal(1);
  readonly pageSize = 20;
  totalPages = signal(1);
  pageNumbers = computed(() =>
    Array.from(
      { length: this.totalPages() },
      (_, index) => index + 1
    )
  );
  private readonly loadedPages = new Map<number, RecipePage>();
  private readonly cuisineHeaders: Record<
    string,
    CuisineHeader
  > = {
      italian: {
        title: 'Italian cuisine',
        image:
          './assets/header-imgs/Property 1=Italian.svg',
      },
      german: {
        title: 'German cuisine',
        image:
          './assets/header-imgs/Property 1=German.svg',
      },
      japanese: {
        title: 'Japanese cuisine',
        image:
          './assets/header-imgs/Property 1=Japanese.svg',
      },
      gourmet: {
        title: 'Gourmet cuisine',
        image:
          './assets/header-imgs/Property 1=Gourmet.svg',
      },
      indian: {
        title: 'Indian cuisine',
        image:
          './assets/header-imgs/Property 1=Indian.svg',
      },
      fusion: {
        title: 'Fusion cuisine',
        image:
          './assets/header-imgs/Property 1=Fusion.svg',
      },
    };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseRecipes: FirebaseRecipes,
    private recipeData: RecipeData
  ) { }

  /**
 * Initializes the selected cuisine and loads its first page.
 */
  async ngOnInit(): Promise<void> {
    const cuisine =
      this.route.snapshot.paramMap.get('cuisine') ?? '';
    if (!this.setCuisineHeader(cuisine)) {
      return;
    }
    try {
      await this.loadFirstRecipePage(cuisine);
    } catch (error) {
      this.handleInitialLoadError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Applies the header data for the selected cuisine.
   *
   */
  private setCuisineHeader(cuisine: string): boolean {
    const header = this.cuisineHeaders[cuisine];
    if (!header) {
      this.router.navigate(['/cookbook']);
      return false;
    }
    this.cuisine = cuisine;
    this.cuisineTitle = header.title;
    this.headerImage = header.image;
    return true;
  }

  /**
   * Loads the recipe count and first page for a cuisine.
   *
   */
  private async loadFirstRecipePage(
    cuisine: string
  ): Promise<void> {
    const [recipeCount, page] = await Promise.all([
      this.firebaseRecipes.getRecipeCountByCuisine(cuisine),
      this.firebaseRecipes.getRecipesByCuisine(cuisine),
    ]);
    const pageCount =
      Math.max(1, Math.ceil(recipeCount / this.pageSize));
    this.totalPages.set(pageCount);
    this.loadedPages.set(1, page);
    this.displayPage(page, 1);
  }

  /**
   * Handles an error while initially loading the category.
   */
  private handleInitialLoadError(error: unknown): void {
    console.error('Fehler beim Laden der Kategorie:', error);
    this.hasLoadingError.set(true);
  }

  /**
 * Opens the selected category recipe.
 */
  openRecipe(recipe: GeneratedRecipe): void {
    this.recipeData.setSelectedRecipe(recipe);
    this.router.navigate(['/recipe']);
  }

  /**
   * Opens the requested recipe page.
   */
  async goToPage(pageNumber: number): Promise<void> {
    if (this.isPageRequestInvalid(pageNumber)) {
      return;
    }
    this.isLoadingMore.set(true);
    try {
      const page = await this.getRequestedPage(pageNumber);
      if (page) {
        this.displayPage(page, pageNumber);
      }
    } catch (error) {
      console.error('Fehler beim Seitenwechsel:', error);
    } finally {
      this.isLoadingMore.set(false);
    }
  }

  /**
   * Returns a cached page or starts loading missing pages.
   */
  private async getRequestedPage(
    pageNumber: number
  ): Promise<RecipePage | null> {
    const cachedPage = this.loadedPages.get(pageNumber);
    if (cachedPage) {
      return cachedPage;
    }
    const firstPage = this.loadedPages.get(1);
    if (!firstPage) {
      return null;
    }
    return this.loadPagesUntil(pageNumber, firstPage);
  }

  /**
   * Loads all missing pages up to the requested page.
   */
  private async loadPagesUntil(
    targetPage: number,
    firstPage: RecipePage
  ): Promise<RecipePage | null> {
    let currentPage = firstPage;
    for (let pageNumber = 2; pageNumber <= targetPage; pageNumber++) {
      const nextPage =
        await this.getNextPage(pageNumber, currentPage);
      if (!nextPage) {
        return null;
      }
      currentPage = nextPage;
    }
    return currentPage;
  }

  /**
   * Returns a cached page or loads the next Firestore page.
   */
  private async getNextPage(
    pageNumber: number,
    previousPage: RecipePage
  ): Promise<RecipePage | null> {
    const cachedPage = this.loadedPages.get(pageNumber);
    if (cachedPage) {
      return cachedPage;
    }
    if (!previousPage.lastDocument) {
      return null;
    }
    const nextPage =
      await this.firebaseRecipes.getRecipesByCuisine(
        this.cuisine,
        previousPage.lastDocument
      );
    this.loadedPages.set(pageNumber, nextPage);
    return nextPage;
  }

  /**
   * Checks whether a page request should be ignored.
   */
  private isPageRequestInvalid(pageNumber: number): boolean {
    return (
      pageNumber < 1 ||
      pageNumber > this.totalPages() ||
      pageNumber === this.currentPage() ||
      this.isLoadingMore()
    );
  }

  /**
   * Displays a recipe page and updates its pagination state.
   */
  private displayPage(
    page: RecipePage,
    pageNumber: number
  ): void {
    this.recipes.set(page.recipes);
    this.currentPage.set(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
 * Clears the previous recipe request and opens the ingredient form.
 */
startNewRecipe(): void {
  this.recipeData.clear();
  this.router.navigate(['/generate-recipe']);
}
}