import React, { useState, useEffect, useRef } from 'react';
import "../styles/navbar.css";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isNavVisible, setIsNavVisible] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(true); // State for dropdown visibility
    const dropdownRef = useRef(null); // Ref for the dropdown menu

    // Toggle visibility of the navigation menu on mobile
    const toggleNavVisibility = () => {
        setIsNavVisible(!isNavVisible);
    };

    // Toggle visibility of the dropdown menu
    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    // Close the dropdown if the user clicks outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownVisible(false); // Close dropdown if click is outside
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside); // Cleanup on unmount
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        alert("Logged out successfully!");
        navigate("/login");
        window.location.reload();
    };

    return (
        <header className="header">
            <Link to="/" className='logo'>
                <img src="/images/logo1.svg" className='logo' alt="logo" />
            </Link>
            <div className="burger">
                <button className="nav-toggle" onClick={toggleNavVisibility}>
                    <span className={`${!isNavVisible ? 'hide' : ''}`}>X</span><span className={`${isNavVisible ? 'hide' : ''}`}>☰</span>
                </button>

                <nav className={`navigation ${isNavVisible ? 'visible' : ''}`}>

                    <div className="nav-buttons">
                        <Link className='nav-btn' to="/multi_comment">
                            <span className="btn-top">
                                <i className="bi bi-file-earmark"></i>
                                <p>File Comments</p>
                            </span>
                        </Link>
                        <Link className='nav-btn' to="youtube_comment">
                            <span className="btn-top">
                                <i className="bi bi-youtube"></i>
                                <p>Youtube Comments</p>
                            </span>
                        </Link>
                    </div>

                    {/* <Link to="/multi_comment" className='nav-link'>
                        <div className="cta-button">
                            <i className="bi bi-file-earmark"></i>
                            <p>File Comments</p>
                        </div>
                    </Link>
                    <Link to="/youtube_comment" className='nav-link'>
                        <div className="cta-button">
                            <i className="bi bi-youtube"></i>
                            <p>Youtube Comments</p>
                        </div>
                    </Link> */}

                    {isLoggedIn ? (
                        <>
                            <div className="home-profile" onClick={toggleDropdown}>
                                <i className="bi bi-person-fill"></i>
                                {/* Username inside dropdown */}
                                {isDropdownVisible && (
                                    <div ref={dropdownRef} className="dropdown-menu">
                                        <p className="dropdown-item username">{localStorage.getItem("username")}</p> {/* Display Username */}
                                        <Link to="/dashboard" className="dropdown-item clickable">Dashboard</Link>
                                        <button className="dropdown-item clickable" onClick={handleLogout}>Log out</button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (

                        <>
                            <Link className='nav-btn' to="/login">
                                <span className="btn-top">
                                    Log In
                                </span>
                            </Link>
                            <Link className='nav-btn' to="/register">
                                <span className="btn-top">
                                    Register
                                </span>
                            </Link>


                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
