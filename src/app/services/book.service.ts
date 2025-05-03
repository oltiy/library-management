import { computed, inject, Injectable, signal } from '@angular/core';
import { Book } from '../models/book.interface';
import { HttpClient } from '@angular/common/http';
import { books as INITIAL_DATA } from '../data/books';
@Injectable({
  providedIn: 'root',
})
export class BookService {
  http = inject(HttpClient);

  private readonly _getBooksFromLocalStorage =
    localStorage.getItem('searchResults');
  private readonly _books = signal<Book[]>(
    this._getBooksFromLocalStorage
      ? (JSON.parse(this._getBooksFromLocalStorage) as Book[])
      : [...INITIAL_DATA]
  );

  getBooks = computed(() => this._books());

  addBook(book: Book): void {
    this._books.update((currentBooks: Book[]) => [...currentBooks, book]);
    localStorage.setItem('searchResults', JSON.stringify(this._books()));
  }

  updateBook(updatedBook: Book): void {
    this._books.update((currentBooks: Book[]) =>
      currentBooks.map((book: Book) =>
        book.id === updatedBook.id ? updatedBook : book
      )
    );
    localStorage.setItem('searchResults', JSON.stringify(this._books()));
  }

  deleteBook(id: string): void {
    this._books.update((currentBooks: Book[]) =>
      currentBooks.filter((book: Book) => book.id !== id)
    );
    localStorage.setItem('searchResults', JSON.stringify(this._books()));
  }

  generateId(): string {
    const existingIds = this._books().map((book: Book) => parseInt(book.id));
    const maxId = Math.max(...existingIds, 0);
    return (maxId + 1).toString();
  }
}
