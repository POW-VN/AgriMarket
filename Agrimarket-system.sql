-- =========================
-- CREATE DATABASE
-- =========================
CREATE DATABASE AgroMarketplace;
GO

USE AgroMarketplace;
GO

-- =========================
-- 1. ADMIN
-- =========================
CREATE TABLE admin (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE()
);

-- =========================
-- 2. CUSTOMER
-- =========================
CREATE TABLE customer (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar_url NVARCHAR(500),

    status VARCHAR(20) CHECK(status IN ('active','banned','pending')) DEFAULT 'pending',

    created_at DATETIME DEFAULT GETDATE()
);

-- =========================
-- 2.1 CUSTOMER ADDRESS
-- =========================
CREATE TABLE customer_address (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    receiver_name NVARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address NVARCHAR(1000) NOT NULL,

    is_default BIT DEFAULT 0,

    FOREIGN KEY (customer_id)
        REFERENCES customer(id)
);

-- =========================
-- 3. FARMER
-- =========================
CREATE TABLE farmer (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    full_name NVARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar_url NVARCHAR(500),

    farm_name NVARCHAR(255) NOT NULL,
    farm_address NVARCHAR(1000) NOT NULL,
    description NVARCHAR(MAX),

    verification_status VARCHAR(20)
        CHECK(verification_status IN ('pending','verified','rejected'))
        DEFAULT 'pending',

    rating_average DECIMAL(3,2) DEFAULT 0,
    total_products INT DEFAULT 0,

    status VARCHAR(20)
        CHECK(status IN ('active','banned','pending'))
        DEFAULT 'pending',

    created_at DATETIME DEFAULT GETDATE()
);

-- =========================
-- 4. OTP VERIFICATION
-- =========================
CREATE TABLE otp_verification (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    email VARCHAR(255) NOT NULL,

    user_type VARCHAR(20)
        CHECK(user_type IN ('customer','farmer','admin')),

    otp_code VARCHAR(10) NOT NULL,

    type VARCHAR(30)
        CHECK(type IN ('register','forgot_password')),

    expired_at DATETIME NOT NULL,

    verified BIT DEFAULT 0,

    created_at DATETIME DEFAULT GETDATE()
);

-- =========================
-- 5. CATEGORIES
-- =========================
CREATE TABLE categories (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),

    parent_id BIGINT NULL,

    FOREIGN KEY (parent_id)
        REFERENCES categories(id)
);

-- =========================
-- 6. PRODUCT
-- =========================
CREATE TABLE product (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    farmer_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,

    name NVARCHAR(255) NOT NULL,

    description NVARCHAR(MAX),

    ai_generated_description BIT DEFAULT 0,

    price DECIMAL(18,2) NOT NULL,

    ai_suggested_price DECIMAL(18,2),

    stock_quantity INT DEFAULT 0,

    unit NVARCHAR(50),

    status VARCHAR(20)
        CHECK(status IN ('draft','pending','approved','rejected','hidden','sold_out'))
        DEFAULT 'draft',

    harvest_date DATE,

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (farmer_id)
        REFERENCES farmer(id),

    FOREIGN KEY (category_id)
        REFERENCES categories(id)
);

-- =========================
-- 7. PRODUCT IMAGE
-- =========================
CREATE TABLE product_image (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    product_id BIGINT NOT NULL,

    img_url NVARCHAR(1000) NOT NULL,

    is_thumbnail BIT DEFAULT 0,

    FOREIGN KEY (product_id)
        REFERENCES product(id)
);

-- =========================
-- 8. PRODUCT DISCOUNT
-- =========================
CREATE TABLE product_discount (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    product_id BIGINT NOT NULL,

    discount_percent DECIMAL(5,2),

    start_date DATETIME,
    end_date DATETIME,

    FOREIGN KEY (product_id)
        REFERENCES product(id)
);

-- =========================
-- 9. PRODUCT VIEW HISTORY
-- =========================
CREATE TABLE product_view_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    customer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,

    viewed_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id),

    FOREIGN KEY (product_id)
        REFERENCES product(id)
);

-- =========================
-- 10. CART
-- =========================
CREATE TABLE cart (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    customer_id BIGINT UNIQUE NOT NULL,

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id)
);

-- =========================
-- 11. CART ITEM
-- =========================
CREATE TABLE cart_item (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,

    quantity INT NOT NULL CHECK(quantity > 0),

    UNIQUE(cart_id, product_id),

    FOREIGN KEY (cart_id)
        REFERENCES cart(id),

    FOREIGN KEY (product_id)
        REFERENCES product(id)
);

-- =========================
-- 12. WISHLIST
-- =========================
CREATE TABLE wishlist (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    customer_id BIGINT UNIQUE NOT NULL,

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id)
);

-- =========================
-- 13. WISHLIST ITEM
-- =========================
CREATE TABLE wishlist_item (
    wishlist_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,

    PRIMARY KEY(wishlist_id, product_id),

    FOREIGN KEY (wishlist_id)
        REFERENCES wishlist(id),

    FOREIGN KEY (product_id)
        REFERENCES product(id)
);

-- =========================
-- 14. CHECKOUT
-- =========================
CREATE TABLE checkout_session (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    subtotal DECIMAL(18,2),
    shipping_fee DECIMAL(18,2),
    discount_amount DECIMAL(18,2),
    total_amount DECIMAL(18,2),

    shipping_address NVARCHAR(1000),

    status VARCHAR(30)
        CHECK(status IN ('pending','payment_processing','completed','expired','cancelled'))
        DEFAULT 'pending',

    created_at DATETIME DEFAULT GETDATE(),

    expired_at DATETIME,

    FOREIGN KEY (customer_id)
        REFERENCES customer(id)
);

-- =========================
-- 15. CHECKOUT ITEM
-- =========================
CREATE TABLE checkout_item (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    checkout_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    product_name NVARCHAR(255),
    product_thumbnail NVARCHAR(1000),

    quantity INT NOT NULL,

    unit_price DECIMAL(18,2),

    subtotal DECIMAL(18,2),

    FOREIGN KEY (checkout_id)
        REFERENCES checkout_session(id),

    FOREIGN KEY (product_id)
        REFERENCES product(id)
);

-- =========================
-- 16. ORDERS
-- =========================
CREATE TABLE orders (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    checkout_id BIGINT NOT NULL,

    total_price DECIMAL(18,2),

    shipping_address NVARCHAR(1000),

    status VARCHAR(20)
        CHECK(status IN ('pending','confirmed','shipping','delivered','cancelled','rejected'))
        DEFAULT 'pending',

    payment_status VARCHAR(20)
        CHECK(payment_status IN ('unpaid','paid','refunded'))
        DEFAULT 'unpaid',

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id),

    FOREIGN KEY (checkout_id)
        REFERENCES checkout_session(id)
);

-- =========================
-- 17. ORDER ITEM
-- =========================
CREATE TABLE order_item (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    order_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    farmer_id BIGINT NOT NULL,

    product_name NVARCHAR(255),

    product_thumbnail NVARCHAR(1000),

    quantity INT NOT NULL,

    unit_price DECIMAL(18,2),

    subtotal DECIMAL(18,2),

    FOREIGN KEY (order_id)
        REFERENCES orders(id),

    FOREIGN KEY (product_id)
        REFERENCES product(id),

    FOREIGN KEY (farmer_id)
        REFERENCES farmer(id)
);

-- =========================
-- 18. ORDER CANCELLATION
-- =========================
CREATE TABLE order_cancellation (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    order_id BIGINT UNIQUE NOT NULL,

    cancel_by VARCHAR(20)
        CHECK(cancel_by IN ('customer','farmer','admin')),

    reason NVARCHAR(MAX),

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
);

-- =========================
-- 19. PAYMENT
-- =========================
CREATE TABLE payment (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    order_id BIGINT NOT NULL,

    payment_method NVARCHAR(100),

    transaction_code VARCHAR(255),

    amount DECIMAL(18,2),

    status VARCHAR(50),

    paid_at DATETIME,

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
);

-- =========================
-- 20. VOUCHER
-- =========================
CREATE TABLE voucher (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    code VARCHAR(100) UNIQUE NOT NULL,

    discount_percent DECIMAL(5,2),

    max_discount DECIMAL(18,2),

    quantity INT,

    expired_at DATETIME
);

-- =========================
-- 21. VOUCHER USAGE
-- =========================
CREATE TABLE voucher_usage (
    voucher_id BIGINT NOT NULL,

    customer_id BIGINT NOT NULL,

    used_at DATETIME DEFAULT GETDATE(),

    PRIMARY KEY(voucher_id, customer_id),

    FOREIGN KEY (voucher_id)
        REFERENCES voucher(id),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id)
);

-- =========================
-- 22. SHIPPING PARTNER
-- =========================
CREATE TABLE shipping_partner (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    company_name NVARCHAR(255),

    phone VARCHAR(20),

    email VARCHAR(255)
);

-- =========================
-- 23. SHIPMENTS
-- =========================
CREATE TABLE shipments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    order_id BIGINT NOT NULL,

    shipping_partner_id BIGINT NOT NULL,

    tracking_code VARCHAR(255),

    status NVARCHAR(100),

    estimated_delivery DATETIME,

    delivered_at DATETIME,

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (order_id)
        REFERENCES orders(id),

    FOREIGN KEY (shipping_partner_id)
        REFERENCES shipping_partner(id)
);

-- =========================
-- 24. PRODUCT REVIEW
-- =========================
CREATE TABLE product_review (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    order_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    customer_id BIGINT NOT NULL,

    rating INT CHECK(rating BETWEEN 1 AND 5),

    comment NVARCHAR(MAX),

    created_at DATETIME DEFAULT GETDATE(),

    UNIQUE(order_id, product_id, customer_id),

    FOREIGN KEY (order_id)
        REFERENCES orders(id),

    FOREIGN KEY (product_id)
        REFERENCES product(id),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id)
);

-- =========================
-- 25. FARMER REVIEW
-- =========================
CREATE TABLE farmer_review (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    farmer_id BIGINT NOT NULL,

    customer_id BIGINT NOT NULL,

    order_id BIGINT NOT NULL,

    rating INT CHECK(rating BETWEEN 1 AND 5),

    comment NVARCHAR(MAX),

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (farmer_id)
        REFERENCES farmer(id),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id),

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
);

-- =========================
-- 26. PREORDER
-- =========================
CREATE TABLE preorder (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    status VARCHAR(50),

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id)
);

-- =========================
-- 27. PREORDER ITEM
-- =========================
CREATE TABLE preorder_item (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    preorder_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    quantity INT,

    expected_harvest_date DATE,

    FOREIGN KEY (preorder_id)
        REFERENCES preorder(id),

    FOREIGN KEY (product_id)
        REFERENCES product(id)
);

-- =========================
-- 28. CONVERSATION
-- =========================
CREATE TABLE conversation (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    farmer_id BIGINT NOT NULL,

    created_at DATETIME DEFAULT GETDATE(),

    UNIQUE(customer_id, farmer_id),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id),

    FOREIGN KEY (farmer_id)
        REFERENCES farmer(id)
);

-- =========================
-- 29. MESSAGES
-- =========================
CREATE TABLE messages (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    conversation_id BIGINT NOT NULL,

    sender_type VARCHAR(20)
        CHECK(sender_type IN ('customer','farmer')),

    sender_id BIGINT NOT NULL,

    message NVARCHAR(MAX),

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (conversation_id)
        REFERENCES conversation(id)
);

-- =========================
-- 30. LIVESTREAM
-- =========================
CREATE TABLE livestream (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    farmer_id BIGINT NOT NULL,

    title NVARCHAR(255),

    description NVARCHAR(MAX),

    start_time DATETIME,

    status NVARCHAR(50),

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (farmer_id)
        REFERENCES farmer(id)
);

-- =========================
-- 31. LIVESTREAM PRODUCT
-- =========================
CREATE TABLE livestream_product (
    livestream_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    PRIMARY KEY(livestream_id, product_id),

    FOREIGN KEY (livestream_id)
        REFERENCES livestream(id),

    FOREIGN KEY (product_id)
        REFERENCES product(id)
);

-- =========================
-- 32. LIVESTREAM COMMENT
-- =========================
CREATE TABLE livestream_comment (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    livestream_id BIGINT NOT NULL,

    sender_type VARCHAR(20)
        CHECK(sender_type IN ('customer','farmer')),

    sender_id BIGINT NOT NULL,

    comment NVARCHAR(MAX),

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (livestream_id)
        REFERENCES livestream(id)
);

-- =========================
-- 33. SUPPORT REQUESTS
-- =========================
CREATE TABLE support_requests (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    sender_type VARCHAR(20)
        CHECK(sender_type IN ('customer','farmer')),

    sender_id BIGINT NOT NULL,

    title NVARCHAR(255),

    description NVARCHAR(MAX),

    status NVARCHAR(50),

    created_at DATETIME DEFAULT GETDATE()
);

-- =========================
-- 34. NOTIFICATION
-- =========================
CREATE TABLE notification (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    receiver_type VARCHAR(20)
        CHECK(receiver_type IN ('customer','farmer')),

    receiver_id BIGINT NOT NULL,

    title NVARCHAR(255),

    content NVARCHAR(MAX),

    is_read BIT DEFAULT 0,

    created_at DATETIME DEFAULT GETDATE()
);

-- =========================
-- 35. REPORT
-- =========================
CREATE TABLE report (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    reporter_type VARCHAR(20)
        CHECK(reporter_type IN ('customer','farmer')),

    target_type VARCHAR(20)
        CHECK(target_type IN ('customer','farmer','product')),

    target_id BIGINT NOT NULL,

    reason NVARCHAR(255),

    description NVARCHAR(MAX),

    status NVARCHAR(50),

    created_at DATETIME DEFAULT GETDATE()
);

-- =========================
-- 36. AI CONVERSATION
-- =========================
CREATE TABLE AI_conversation (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    title NVARCHAR(255),

    created_at DATETIME DEFAULT GETDATE(),

    updated_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id)
);

-- =========================
-- 37. AI MESSAGE
-- =========================
CREATE TABLE AI_message (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    conversation_id BIGINT NOT NULL,

    sender_type VARCHAR(20)
        CHECK(sender_type IN ('user','AI')),

    message NVARCHAR(MAX),

    send_time DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (conversation_id)
        REFERENCES AI_conversation(id)
);

-- =========================
-- 38. FARMER FOLLOW
-- =========================
CREATE TABLE farmer_follow (
    customer_id BIGINT NOT NULL,

    farmer_id BIGINT NOT NULL,

    created_at DATETIME DEFAULT GETDATE(),

    PRIMARY KEY(customer_id, farmer_id),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id),

    FOREIGN KEY (farmer_id)
        REFERENCES farmer(id)
);

-- =========================
-- 39. AI PRODUCT DESCRIPTION HISTORY
-- =========================
CREATE TABLE AI_product_description_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    farmer_id BIGINT NOT NULL,

    product_id BIGINT NULL,

    product_name NVARCHAR(255),

    input_prompt NVARCHAR(MAX),

    generated_description NVARCHAR(MAX),

    generated_keywords NVARCHAR(MAX),

    generated_hashtags NVARCHAR(MAX),

    language VARCHAR(50),

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (farmer_id)
        REFERENCES farmer(id),

    FOREIGN KEY (product_id)
        REFERENCES product(id)
);

-- =========================
-- 40. AI PRICE SUGGESTION
-- =========================
CREATE TABLE AI_price_suggestion (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    farmer_id BIGINT NOT NULL,

    product_id BIGINT NULL,

    product_name NVARCHAR(255),

    input_cost_price DECIMAL(18,2),

    market_average_price DECIMAL(18,2),

    suggested_price DECIMAL(18,2),

    min_price DECIMAL(18,2),

    max_price DECIMAL(18,2),

    ai_reason NVARCHAR(MAX),

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (farmer_id)
        REFERENCES farmer(id),

    FOREIGN KEY (product_id)
        REFERENCES product(id)
);

-- =========================
-- 41. AI RECOMMENDATION
-- =========================
CREATE TABLE AI_recommendation (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    recommendation_score DECIMAL(5,2),

    reason NVARCHAR(MAX),

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id),

    FOREIGN KEY (product_id)
        REFERENCES product(id)
);

-- =========================
-- 42. AI SEARCH HISTORY
-- =========================
CREATE TABLE AI_search_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    prompt NVARCHAR(MAX),

    ai_response NVARCHAR(MAX),

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (customer_id)
        REFERENCES customer(id)
);

-- =========================
-- 43. AI CONTENT MODERATION
-- =========================
CREATE TABLE AI_content_moderation (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    product_id BIGINT NOT NULL,

    is_safe BIT DEFAULT 1,

    flagged_reason NVARCHAR(MAX),

    checked_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (product_id)
        REFERENCES product(id)
);