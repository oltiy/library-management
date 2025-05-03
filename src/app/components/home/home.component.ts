import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BooksListComponent } from '../books-list/books-list.component';
import { SearchComponent } from '../search/search.component';
import { Book } from '../../models/book.interface';
@Component({
  selector: 'app-home',
  imports: [BooksListComponent, SearchComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  searchResults = signal<Book[]>([]);
  onSearchResults(results: Book[]) {
    this.searchResults.set(results);
  }
}
