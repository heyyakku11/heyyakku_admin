import './category.css';
import { DUMMY_CATEGORIES } from '../../data/dummyData';

function formatDateTime(date: string) {
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function Categories() {
    const categories = DUMMY_CATEGORIES;

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

export default Categories;