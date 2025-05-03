import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  Signal,
  input,
  effect,
} from '@angular/core';
import { BookService } from '../../services/book.service';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Book } from '../../models/book.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BookFormComponent } from '../book-form/book-form.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-books-list',
  imports: [
    MatTableModule,
    DatePipe,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './books-list.component.html',
  styleUrl: './books-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooksListComponent {
  bookService = inject(BookService);
  books = input<Book[]>();
  booksData = signal<Book[]>([]);
  currentSort = signal<Sort>({ active: '', direction: '' });
  length: Signal<number> = computed(() => this.books()?.length ?? 0);
  pageIndex = signal<number>(0);
  pageSize = signal<number>(10);
  pageSizeOptions = [5, 10];

  showPageSizeOptions = true;

  dialogWidth =
    window.innerWidth <= 600
      ? '95%'
      : window.innerWidth <= 960
      ? '70%'
      : '500px';

  dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'title',
    'author',
    'publicationDate',
    'catalogNumber',
    'actions',
  ];

  constructor() {
    effect(() => {
      const totalBooks = this.books()?.length ?? 0;
      const totalPages = Math.ceil(totalBooks / this.pageSize());
      const newPageIndex = Math.max(
        0,
        Math.min(this.pageIndex(), totalPages - 1)
      );
      if (this.pageIndex() !== newPageIndex) {
        this.pageIndex.set(newPageIndex);
      }
    });
  }

  openBookDetails(book: Book) {
    this.dialog.open(BookFormComponent, {
      width: this.dialogWidth,
      height: 'auto',
      data: { book, disableEdit: true },
    });
  }

  deleteBook(id: string) {
    this.bookService.deleteBook(id);
  }

  editBook(book: Book) {
    this.dialog.open(BookFormComponent, {
      width: this.dialogWidth,
      data: { book, disableEdit: false },
      height: 'auto',
    });
  }

  addBook() {
    this.dialog.open(BookFormComponent, {
      width: this.dialogWidth,
      data: { book: null, disableEdit: false },
      height: 'auto',
    });
  }

  handlePageEvent(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  getBooks() {
    const data = this.books();
    const sort = this.currentSort();

    if (!sort.active || sort.direction === '') {
      return data?.slice(
        this.pageIndex() * this.pageSize(),
        (this.pageIndex() + 1) * this.pageSize()
      );
    }

    const sortedData = data?.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'title':
          return this.compare(
            a.title.toLowerCase(),
            b.title.toLowerCase(),
            isAsc
          );
        case 'author':
          return this.compare(
            a.author.toLowerCase(),
            b.author.toLowerCase(),
            isAsc
          );
        case 'catalogNumber':
          return this.compare(
            a.catalogNumber.toLowerCase(),
            b.catalogNumber.toLowerCase(),
            isAsc
          );
        case 'publicationDate':
          return this.compare(a.publicationDate, b.publicationDate, isAsc);
        default:
          return 0;
      }
    });

    return sortedData?.slice(
      this.pageIndex() * this.pageSize(),
      (this.pageIndex() + 1) * this.pageSize()
    );
  }

  sortData(sort: Sort) {
    this.currentSort.set(sort);
    this.pageIndex.set(0);
  }

  compare(
    a: string | number | Date,
    b: string | number | Date,
    isAsc: boolean
  ) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
