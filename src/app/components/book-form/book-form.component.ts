import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Book } from '../../models/book.interface';
import { BookService } from '../../services/book.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';

export const ISRAELI_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
  ],
  providers: [provideMomentDateAdapter(ISRAELI_DATE_FORMATS)],
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookFormComponent implements OnInit {
  fb = inject(FormBuilder);
  bookService = inject(BookService);
  dialogRef = inject(MatDialogRef<BookFormComponent>);
  data = inject<{ book: Book; disableEdit: boolean }>(MAT_DIALOG_DATA);
  booksUpdated = signal<Book | undefined>(undefined);
  disableEditUpdated = signal<boolean>(false);

  bookForm!: FormGroup;

  constructor() {
    this.booksUpdated.set(this.data.book);
    this.disableEditUpdated.set(this.data.disableEdit);
  }

  ngOnInit(): void {
    this.initForm();
    if (this.disableEditUpdated()) {
      this.bookForm.disable();
    }

    if (this.booksUpdated()) {
      this.bookForm.patchValue(this.booksUpdated() as Book);
    }
  }

  initForm(): void {
    this.bookForm = this.fb.group({
      id: [{ value: this.booksUpdated()?.id }],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      author: ['', [Validators.required]],
      publicationDate: ['', [Validators.required]],
      catalogNumber: [
        '',
        [Validators.required, this.uniqueCatalogNumberValidator()],
      ],
      amount: [0, [Validators.required]],
    });
  }

  uniqueCatalogNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (this.booksUpdated()?.catalogNumber === value) {
        return null;
      }

      const isUnique = !this.bookService
        .getBooks()
        .some((book) => book.catalogNumber === value);

      return isUnique ? null : { uniqueCatalogNumber: true };
    };
  }

  get title() {
    return this.bookForm.get('title');
  }

  get description() {
    return this.bookForm.get('description');
  }

  get author() {
    return this.bookForm.get('author');
  }

  get publicationDate() {
    return this.bookForm.get('publicationDate');
  }

  get catalogNumber() {
    return this.bookForm.get('catalogNumber');
  }

  get amount() {
    return this.bookForm.get('amount');
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      return;
    }

    const formValue = this.bookForm.getRawValue();

    if (this.booksUpdated()?.id) {
      this.bookService.updateBook(formValue);
    } else {
      if (!formValue.id) {
        formValue.id = this.bookService.generateId();
      }
      this.bookService.addBook(formValue);
    }
    this.dialogRef.close(formValue);
    this.bookForm.reset();
  }
}
