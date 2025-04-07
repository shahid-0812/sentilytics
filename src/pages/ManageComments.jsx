import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/managecomments.css";
const formatDate = (isoString) => {
    const dateObj = new Date(isoString);
    return {
        date: dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        time: dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
    };
};
const ManageComments = () => {
    const navigate = useNavigate();
    const [singleComments, setSingleComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteredSingleComments, setFilteredSingleComments] = useState([]);
    const [sortField, setSortField] = useState("date_created");
    const [sortOrder, setSortOrder] = useState("desc");
    const [filterSentiment, setFilterSentiment] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editedValue, setEditedValue] = useState({});
    const [loadingEdits, setLoadingEdits] = useState({});
    useEffect(() => {
        setLoading(true)
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        const fetchSingleComments = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/single/", {
                    method: "GET",
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setSingleComments(data);
                    setFilteredSingleComments(data);
                } else {
                    console.error("Error fetching single comments:", data);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
            finally {
                setLoading(false)
            }
        };

        fetchSingleComments()
    }, [navigate]);

    useEffect(() => {
        handleFilter();
    }, [filterSentiment])
    const handleSubmitEdit = async (comment) => {
        const token = localStorage.getItem("token");
        const newSentiment = editedValue[comment.id]?.trim();

        if (!newSentiment || newSentiment === comment.sentiment) return; // Prevent unnecessary updates

        setLoadingEdits((prev) => ({ ...prev, [comment.id]: true }));

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/single/${comment.id}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sentiment: newSentiment }),
            });

            if (response.ok) {
                setSingleComments((prevData) =>
                    prevData.map((c) =>
                        c.id === comment.id ? { ...c, corrected_sentiment: newSentiment, is_updated: true } : c
                    )
                );
                setFilteredSingleComments((prevData) =>
                    prevData.map((c) =>
                        c.id === comment.id ? { ...c, corrected_sentiment: newSentiment, is_updated: true } : c
                    )
                );
                setEditedValue((prev) => ({ ...prev, [comment.id]: "" })); // Clear the input after editing
            }
        } catch (error) {
            console.error("Error updating sentiment:", error);
        } finally {
            setLoadingEdits((prev) => ({ ...prev, [comment.id]: false }));
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This comment will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/single/${id}/`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Token ${localStorage.getItem("token")}`,
                        },
                    });

                    if (response.ok) {
                        Swal.fire("Deleted!", "The comment has been deleted.", "success");
                        setSingleComments((prevComments) => prevComments.filter(comment => comment.id !== id)); // Remove from UI
                        setFilteredSingleComments((prevComments) => prevComments.filter(comment => comment.id !== id)); // Remove from UI
                    } else {
                        Swal.fire("Failed!", "Failed to delete the comment.", "error");
                    }
                } catch (error) {
                    Swal.fire("Error!", "Something went wrong.", "error");
                    console.error("Delete error:", error);
                }
            }
        });
    };


    //editmode
    const toggleEditMode = () => {
        if (!editMode) {
            Swal.fire({
                icon: "info",
                title: "Notice!",
                text: "You can only edit a sentiment once. Please provide genuine feedback to help improve the model.",
            });
        }
        setEditMode(!editMode);
    };

    // Sorting Function
    const handleSort = (field) => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortOrder(newOrder);

        const sortedData = [...filteredSingleComments].sort((a, b) => {
            let valA = a[field];
            let valB = b[field];

            // Handle Date Sorting
            if (field === "date_created") {
                valA = new Date(a.date_created);
                valB = new Date(b.date_created);
            }

            if (valA < valB) return newOrder === "asc" ? -1 : 1;
            if (valA > valB) return newOrder === "asc" ? 1 : -1;
            return 0;
        });

        setFilteredSingleComments(sortedData);
    };

    // Filtering Function
    const handleFilter = () => {
        let filtered = [...singleComments];

        if (filterSentiment) {
            filtered = filtered.filter((comment) => comment.sentiment === filterSentiment);
        }
        setFilteredSingleComments(filtered);
    };

    return (
        <div className="dashboard-container">
            <h2>Welcome, {localStorage.getItem("username")}!</h2>

            {/* Tab Navigation */}
            <div className="tab-container">
            </div>
            <div className="tab-content">
                <div>
                    <h3>Your Single Comments</h3>
                    <p>Note: If the model predicted a comment sentiment incorrectly, you can correct it below.</p>
                </div>


                <div className="dashboard-filter">
                    <label>Filter by Sentiment:</label>
                    <select value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)}>
                        <option value="">All</option>
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                        <option value="neutral">Neutral</option>
                    </select>
                    <button className="btn-pages-small" onClick={toggleEditMode}>{editMode ? "Exit Edit Mode" : "Enable Edit Mode"}</button>
                </div>
                {loading ? (
                    <div class="text-center loading-align">
                        <div role="status">
                            <span class="sr-only">Loading...</span>
                        </div></div>
                ) :
                    filteredSingleComments.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Index</th>
                                    <th>Comment</th>
                                    <th className={`sort-th ${sortField === "date_created" && "active-sort"}`} onClick={() => handleSort("date_created", "single")}>
                                        Date Created {sortField === "date_created" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                                    </th>
                                    <th>Time</th>
                                    <th className={`sort-th ${sortField === "sentiment" && "active-sort"}`} onClick={() => handleSort("sentiment", "single")}>
                                        Sentiment {sortField === "sentiment" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                                    </th>
                                    {!editMode ? <th>Score</th> : <th colSpan={2} >Action</th>}

                                </tr>
                            </thead>
                            <tbody>
                                {filteredSingleComments.map((comment, index) => {
                                    const { date, time } = formatDate(comment.date_created);
                                    return (
                                        <tr key={comment.id}>
                                            <td>{index + 1}</td>
                                            <td className={`comment ${comment.comment.length > 400 && "expandable"}`}  >{comment.comment}</td>
                                            <td>{date}</td>
                                            <td>{time}</td>
                                            {!editMode ? <td className={`table-${comment.sentiment}`}>{comment.sentiment || "N/A"}</td> : (!comment.is_updated ? (
                                                <td>
                                                    <select
                                                        value={editedValue[comment.id] || comment.sentiment}
                                                        onChange={(e) => setEditedValue((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                                                        disabled={loadingEdits[comment.id]}
                                                        className="edit-filter"
                                                    >
                                                        <option value="positive">Positive</option>
                                                        <option value="negative">Negative</option>
                                                        <option value="neutral">Neutral</option>
                                                    </select>
                                                </td>

                                            ) : (<td className={`dashboard-${comment.sentiment}`}>{comment.sentiment || "N/A"}</td>
                                            ))}
                                            {editMode ?
                                                (
                                                    !comment.is_updated ? (
                                                        <><td>
                                                            <button
                                                                className="btn-filter btn-confirm"
                                                                onClick={() => handleSubmitEdit(comment)} disabled={loadingEdits[comment.id]}>
                                                                {loadingEdits[comment.id] ? "Saving..." : "Confirm"}
                                                            </button>
                                                        </td>
                                                            <td>
                                                                <button onClick={() => handleDelete(comment.id)} className="btn-filter delete-btn">Delete</button>
                                                            </td>
                                                        </>
                                                    ) : <>
                                                        <td>{comment.feedback_verified === null
                                                            ? `Suggestion : ${comment.corrected_sentiment}`
                                                            : comment.feedback_verified === true
                                                                ? `Prediction Error : ${comment.predicted_sentiment}`
                                                                : `Suggested : ${comment.corrected_sentiment}`}</td>

                                                        <td>{comment.feedback_verified === null
                                                            ? "Sentiment correction Pending..."
                                                            : comment.feedback_verified === true
                                                                ? "Sentiment Verified"
                                                                : "model predicted correctly"}</td>
                                                    </>
                                                )
                                                : <td>{comment?.feedback_verified === true ? "---" : comment.score}</td>
                                            }
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p>No single comments found.</p>
                    )}
            </div>
        </div>
    )
}
export default ManageComments;
