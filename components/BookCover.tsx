import Image from "next/image";
import { bookTitle, type Book } from "@/lib/catalog";

export function BookCover({ book, priority = false }: { book: Book; priority?: boolean }) {
  return (
    <div className="cover-frame">
      <Image
        src={book.image_url}
        alt={`Front cover of ${bookTitle(book)}`}
        width={1200}
        height={1697}
        sizes="(max-width: 700px) 400px, 600px"
        priority={priority}
      />
    </div>
  );
}
