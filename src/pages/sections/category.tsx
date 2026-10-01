import './category.css';
import { useEffect, useState } from 'react';
import { getCategories } from '../../services/categoryService';
import type { Category } from '../../types/category';

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatDateTime(date: string) {
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function Category() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
    
            try {
    
                setLoading(true);
                setError(null);
    
                const response = await getCategories();
    
                if (response.success) {
                    setCategories(response.data ?? []);
                } else {
                    setError(response.message);
                }
    
            } catch (ex) {
    
                console.error(ex);
    
                if (ex instanceof Error) {
                    setError(ex.message);
                } else {
                    setError("Failed to load categories.");
                }
    
            } finally {
    
                setLoading(false);
    
            }
        }

        if (loading) {
        return (
            <div className="categories-section">
                <p>Loading categories...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="categories-section">
                <p>Failed to load categories: {error}</p>
            </div>
        );
    }

    function handleCreateCategory() {
        // Open create category modal
        console.log("Create category");
    }

    return (
        <div className="category-section">

            {/* Header */}
            <div className="category-header">

                <div>
                    <h2>Categories</h2>
                    <p>
                        Manage categories used across Yakku.
                    </p>
                </div>

                <div className="category-header-actions">

                    <span className="category-count">
                        {categories.length} categories
                    </span>

                    <button
                        className="create-category-button"
                        onClick={handleCreateCategory}
                    >
                        + Create Category
                    </button>

                </div>

            </div>

            {/* Category list */}
            <div className="category-container">

                {categories.map((category) => (

                    <div
                        className="category-card"
                        key={category.id}
                    >

                        {/* Card header */}
                        <div className="category-card-header">

                            <div className="category-icon">
                                {category.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="category-info">
                                <h3>{category.name}</h3>
                                <span>{category.slug}</span>
                            </div>

                            <span
                                className={`category-status ${
                                    category.isActive
                                        ? "active"
                                        : "inactive"
                                }`}
                            >
                                {category.isActive
                                    ? "Active"
                                    : "Inactive"}
                            </span>

                        </div>

                        {/* Divider */}
                        <div className="category-divider"></div>

                        {/* Card footer */}
                        <div className="category-card-footer">

                            <span className="category-created">
                                Created {formatDateTime(category.createdAt)}
                            </span>

                            <button className="category-menu">
                                ⋮
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Category;