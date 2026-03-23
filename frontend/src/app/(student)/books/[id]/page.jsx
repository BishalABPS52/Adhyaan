"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BookProfile from "@/components/book/BookProfile";
import Button from "@/components/ui/Button";

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id;
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://adhyaan.onrender.com/api/v1";
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "https://adhyaan.onrender.com";

      const response = await fetch(`${apiUrl}/books/${bookId}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        // Map backend data to expected format
        const bookData = {
          id: data.id,
          title: data.title,
          contentType:
            data.file_url && data.file_url.endsWith(".pdf") ? "pdf" : "text",
          pdfUrl: data.file_url
            ? `${backendUrl}/uploads/${data.file_url}`
            : null,
          author: {
            name: data.author_name || "Unknown Author",
            bio: data.author_bio || "No bio available",
            avatar: "👤",
          },
          coverImage: data.cover_image_url
            ? `${backendUrl}/uploads/${data.cover_image_url}`
            : null,
          rating: parseFloat(data.rating) || 0,
          totalRatings: data.total_reviews || 0,
          readerCount: data.total_readers || 0,
          description: data.description || "No description available.",
          isbn: data.isbn || "N/A",
          pages: data.pages || 0,
          language: data.language || "English",
          publisher: data.publisher || "Self-published",
          publishedDate: data.publication_year || new Date().getFullYear(),
          genres: data.genre
            ? [data.genre]
            : data.book_type
              ? [data.book_type]
              : [],
          reviews: (data.recent_ratings || []).map((rating) => ({
            id: rating.id,
            userName: rating.user_name || "Anonymous",
            userAvatar: "👤",
            rating: rating.rating,
            date: new Date(rating.created_at).toLocaleDateString(),
            comment: rating.review || "",
            likes: 0,
            helpful: false,
          })),
          fileUrl: data.file_path
            ? data.file_path.startsWith("http")
              ? data.file_path
              : data.file_path.startsWith("/")
                ? `${backendUrl}${data.file_path}`
                : `${backendUrl}/${data.file_path}`
            : data.pdf_url
              ? data.pdf_url.startsWith("http")
                ? data.pdf_url
                : data.pdf_url.startsWith("/")
                  ? `${backendUrl}${data.pdf_url}`
                  : `${backendUrl}/${data.pdf_url}`
              : null,
        };
        setBook(bookData);
      } else {
        setError("Book not found");
      }
    } catch (err) {
      console.error("Error fetching book:", err);
      setError("Failed to load book");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2>Loading book details...</h2>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1>Book Not Found</h1>
        <p>{error || "The book you are looking for does not exist."}</p>
        <Button onClick={() => router.push("/search")}>Back to Search</Button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <BookProfile book={book} />
    </div>
  );
}
