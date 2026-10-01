import './category.css';

const categories = [
    {
        id: "a22d9e6f-7000-4d4a-9115-a1a6b8c9e05f",
        name: "cartoon",
        slug: "CARTOON",
        isActive: true,
        createdAt: "2026-09-30T07:27:41.846859Z"
    },
    {
        id: "08bd7765-a09b-47fe-8ede-4ececd7e0e31",
        name: "relationship",
        slug: "RELATIONSHIP",
        isActive: true,
        createdAt: "2026-09-28T07:29:40.609344Z"
    },
    {
        id: "12263516-1232-451c-bc5b-a266347ea257",
        name: "tech",
        slug: "TECH",
        isActive: true,
        createdAt: "2026-09-28T07:29:27.022223Z"
    },
    {
        id: "9b036d73-f3ed-479f-a9a1-6afffb8cd1d0",
        name: "world news",
        slug: "WORLD-NEWS",
        isActive: true,
        createdAt: "2026-09-28T07:29:17.581334Z"
    }
];

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function Category() {

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
                                Created {formatDate(category.createdAt)}
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