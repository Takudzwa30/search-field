import { useState, useEffect, useCallback } from "react";

// Libraries
import axios from "axios";

// Icons
import { IoSearchSharp } from "react-icons/io5";

// Styles
import Style from "./HomePage.module.css";

const HomePage = () => {
  // State for managing posts data
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce function
  const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Fetch Posts
  const fetchPosts = useCallback(async (query = "", page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      setNoResults(false);

      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/posts",
        {
          params: {
            q: query,
            _page: page,
            _limit: 10,
          },
        }
      );

      // Update state with the fetched data
      if (response.data.length > 0) {
        setPosts(response.data);

        // Calculate total pages
        const totalPosts = parseInt(response.headers["x-total-count"], 10);
        setTotalPages(Math.ceil(totalPosts / 10));
      } else {
        setNoResults(true);
        setTotalPages(1);
      }
    } catch (err) {
      // Handle errors
      if (axios.isAxiosError(err)) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchPosts = useCallback(
    debounce((query, page) => fetchPosts(query, page), 300),
    []
  );

  // Handle input change
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    debouncedFetchPosts(query, 1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchPosts(searchQuery, newPage);
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className={Style.blogs}>
      <h1>Search Blogs</h1>

      <div className={Style.inputWrapper}>
        <IoSearchSharp />
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Type to search..."
        />
      </div>

      {isLoading ? (
        <div className={Style.loader} />
      ) : error ? (
        <p>Error: {error}</p>
      ) : noResults ? (
        <p>No results found</p>
      ) : (
        <>
          <div className={Style.posts}>
            {posts.map((post) => (
              <div className={Style.singleBlog} key={post.id}>
                <h2>{post.title}</h2>
                <p>{post.body}</p>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className={Style.pagination}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
