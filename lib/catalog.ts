export type Book = {
  id?: string;
  slug: string;
  name: string;
  subject: "English" | "Mathematics";
  book_number: string;
  author: string;
  description: string;
  price_kobo: number;
  image_url: string;
  stock_quantity: number | null;
  is_active: boolean;
};

const englishDescription =
  "A Greater Height to Verbal Reasoning book for English 2 learners, written by F.O. Bamidele.";
const mathsDescription =
  "A Greater Height to Quantitative Reasoning book for Maths 2 learners, written by F.O. Bamidele.";

export const catalogue: Book[] = [
  { slug: "english-2-book-02", name: "Greater Height to Verbal Reasoning", subject: "English", book_number: "02", author: "F.O. Bamidele", description: englishDescription, price_kobo: 350000, image_url: "/books/english-book-02.jpg", stock_quantity: null, is_active: true },
  { slug: "english-2-book-04", name: "Greater Height to Verbal Reasoning", subject: "English", book_number: "04", author: "F.O. Bamidele", description: englishDescription, price_kobo: 350000, image_url: "/books/english-book-04.jpg", stock_quantity: null, is_active: true },
  { slug: "english-2-book-05", name: "Greater Height to Verbal Reasoning", subject: "English", book_number: "05", author: "F.O. Bamidele", description: englishDescription, price_kobo: 350000, image_url: "/books/english-book-05.jpg", stock_quantity: null, is_active: true },
  { slug: "maths-2-book-02", name: "Greater Height to Quantitative Reasoning", subject: "Mathematics", book_number: "02", author: "F.O. Bamidele", description: mathsDescription, price_kobo: 350000, image_url: "/books/maths-book-02.jpg", stock_quantity: null, is_active: true },
  { slug: "maths-2-book-04", name: "Greater Height to Quantitative Reasoning", subject: "Mathematics", book_number: "04", author: "F.O. Bamidele", description: mathsDescription, price_kobo: 350000, image_url: "/books/maths-book-04.jpg", stock_quantity: null, is_active: true },
  { slug: "maths-2-book-05", name: "Greater Height to Quantitative Reasoning", subject: "Mathematics", book_number: "05", author: "F.O. Bamidele", description: mathsDescription, price_kobo: 350000, image_url: "/books/maths-book-05.jpg", stock_quantity: null, is_active: true },
];

export const bookTitle = (book: Pick<Book, "subject" | "name" | "book_number">) =>
  `${book.subject === "English" ? "English 2" : "Maths 2"} — ${book.name} — Book ${book.book_number}`;
