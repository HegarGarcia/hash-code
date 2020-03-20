from sys import argv
from os import path
import time


class Library:
    def __init__(self, id, sign_up, books_per_day, book_list):
        self.id = id
        self.sign_up = sign_up
        self.books_per_day = books_per_day
        self._book_list = sorted(
            book_list, key=lambda book: book.score, reverse=True
        )
        self.score = sum(book_list)

    @property
    def size(self):
        return len(self._book_list)

    @property
    def throughput(self):
        return self.score / self.sign_up

    @property
    def books(self):
        return self._book_list

    @books.setter
    def books(self, books):
        self._book_list = sorted(
            book_list, key=lambda book: book.score, reverse=True
        )
        self.score = sum(books)

    def filter_banned(self, banned_list):
        self._book_list = [
            book for book in self._book_list if book.id not in banned_list
        ]

    @property
    def books_ids(self):
        return map(lambda book: book.id, self._book_list)

    def __repr__(self):
        return f'Library {self.id}'


class Book:
    def __init__(self, id, score):
        self.id = id
        self.score = int(score)

    def __repr__(self):
        return f'Book: ID: {self.id} - Score: {self.score}'

    def __radd__(self, other):
        return self.score + other


def next_line(file):
    return file.readline().split()


def print_problem(libraries, books, total_days):
    print((
        f"Total libraries: {len(libraries)}\n"
        f"Total books: {len(books)}\n"
        f"Limit days: {total_days}"
    ))


libraries = []
books = []


filename = argv[1]

print("Reading and parsing")

with open(filename, 'r') as file:
    _, total_libraries, total_days = [int(n) for n in next_line(file)]
    books = [Book(id, score) for id, score in enumerate(next_line(file))]

    for id in range(total_libraries):
        _, sign_up, books_per_day = [int(n) for n in next_line(file)]
        book_list = [books[int(id)] for id in next_line(file)]
        libraries.append(Library(id, sign_up, books_per_day, book_list))

print_problem(libraries, books, total_days)

libraries.sort(key=lambda library: library.throughput, reverse=True)
banned_books = set()
results = []

print("Processing")

while len(libraries) > 0:
    library = libraries.pop(0)

    library.filter_banned(banned_books)
    banned_books.update(library.books_ids)

    results.append(library)

    tmp_libraries = []

    start_time = time.time()
    for lib in libraries:

        lib.filter_banned(banned_books)

        if lib.size > 0:
            tmp_libraries.append(lib)

    print("--- %s seconds ---" % (time.time() - start_time))

    libraries = tmp_libraries

    print(len(libraries))


output_path = path.join('./outputs', path.split(filename)[1])

print("Exporting")

with open(output_path, 'w') as file:
    file.write(f'{len(results)}\n')

    for library in results:
        file.write(f'{library.id} {library.size}\n')
        file.write(f"{' '.join(map(str, library.books_ids))}\n")
