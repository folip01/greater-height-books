update public.products
set image_url = case slug
  when 'english-2-book-02' then '/books/english-book-02.jpg'
  when 'english-2-book-04' then '/books/english-book-04.jpg'
  when 'english-2-book-05' then '/books/english-book-05.jpg'
  when 'maths-2-book-02' then '/books/maths-book-02.jpg'
  when 'maths-2-book-04' then '/books/maths-book-04.jpg'
  when 'maths-2-book-05' then '/books/maths-book-05.jpg'
end
where slug in (
  'english-2-book-02', 'english-2-book-04', 'english-2-book-05',
  'maths-2-book-02', 'maths-2-book-04', 'maths-2-book-05'
);
