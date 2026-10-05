insert into public.products(name, slug, subject, book_number, author, description, price_kobo, image_url, stock_quantity)
values
('Greater Height to Verbal Reasoning','english-2-book-02','English','02','F.O. Bamidele','A Greater Height to Verbal Reasoning book for English 2 learners, written by F.O. Bamidele.',350000,'/books/english-book-02.jpg',null),
('Greater Height to Verbal Reasoning','english-2-book-04','English','04','F.O. Bamidele','A Greater Height to Verbal Reasoning book for English 2 learners, written by F.O. Bamidele.',350000,'/books/english-book-04.jpg',null),
('Greater Height to Verbal Reasoning','english-2-book-05','English','05','F.O. Bamidele','A Greater Height to Verbal Reasoning book for English 2 learners, written by F.O. Bamidele.',350000,'/books/english-book-05.jpg',null),
('Greater Height to Quantitative Reasoning','maths-2-book-02','Mathematics','02','F.O. Bamidele','A Greater Height to Quantitative Reasoning book for Maths 2 learners, written by F.O. Bamidele.',350000,'/books/maths-book-02.jpg',null),
('Greater Height to Quantitative Reasoning','maths-2-book-04','Mathematics','04','F.O. Bamidele','A Greater Height to Quantitative Reasoning book for Maths 2 learners, written by F.O. Bamidele.',350000,'/books/maths-book-04.jpg',null),
('Greater Height to Quantitative Reasoning','maths-2-book-05','Mathematics','05','F.O. Bamidele','A Greater Height to Quantitative Reasoning book for Maths 2 learners, written by F.O. Bamidele.',350000,'/books/maths-book-05.jpg',null)
on conflict(slug) do nothing;
