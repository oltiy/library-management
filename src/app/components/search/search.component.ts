import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Book } from '../../models/book.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookService } from '../../services/book.service';
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  bookService = inject(BookService);
  books = this.bookService.getBooks;
  searchResults = output<Book[]>();

  searchTerm = new FormControl('');

  constructor() {
    effect(() => {
      this.search(this.searchTerm.value);
    });

    this.searchTerm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        const term = value?.toLowerCase().trim() ?? null;
        localStorage.setItem('searchTerm', term ?? '');
        this.search(term);
      });
  }

  ngOnInit(): void {
    const savedTerm = localStorage.getItem('searchTerm') ?? '';

    this.searchTerm.patchValue(savedTerm);

    this.searchResults.emit(this.books());
  }

  search(value: string | null): void {
    if (!value || value === '') {
      this.searchResults.emit(this.books());
      return;
    }

    const results = this.books().filter((book) =>
      book.title.toLowerCase().includes(value)
    );

    this.searchResults.emit(results);
  }
}
