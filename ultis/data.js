const mongoose = require('mongoose');
const Category = require('../schemas/Category');
const Publisher = require('../schemas/Publisher');
const Book = require('../schemas/Book');
const Role = require('../schemas/Role');
const User = require('../schemas/User');
const Author = require('../schemas/Author');

const createTestData = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/LibrarySystem');
        console.log("Connected to MongoDB for data injection...");

        // 1. Create Role
        let role = await Role.findOne({ name: 'Member' });
        if (!role) {
            role = await Role.create({ name: 'Member', description: 'Regular library member' });
        }

        // 2. Create User
        let user = await User.findOne({ username: 'testuser' });
        if (!user) {
            user = await User.create({
                username: 'testuser',
                password_hash: 'hashedpassword',
                full_name: 'Test Nguyen',
                email: 'test@example.com',
                role_id: role._id
            });
        }

        // 3. Create Publisher and Category
        let publisher = await Publisher.findOne({ name: 'NXB Tre' });
        if (!publisher) {
            publisher = await Publisher.create({ name: 'NXB Tre', address: 'Ho Chi Minh', email: 'tre@nxb.vn' });
        }

        let category = await Category.findOne({ name: 'Programming' });
        if (!category) {
            category = await Category.create({ name: 'Programming', description: 'IT and Books' });
        }

        // 4. Create Books
        const booksData = [
            {
                isbn: '978-0132350884',
                title: 'Clean Code',
                publisher_id: publisher._id,
                category_id: category._id,
                published_year: 2008,
                quantity: 10,
                available_copies: 5
            },
            {
                isbn: '978-0134494166',
                title: 'Clean Architecture',
                publisher_id: publisher._id,
                category_id: category._id,
                published_year: 2017,
                quantity: 10,
                available_copies: 2
            }
        ];

        for (const b of booksData) {
            await Book.findOneAndUpdate({ isbn: b.isbn }, b, { upsert: true, new: true });
        }

        console.log("-----------------------------------------");
        console.log("Test data created successfully!");
        console.log("USER ID: ", user._id);
        console.log("BOOK 1 ID: ", (await Book.findOne({ isbn: '978-0132350884' }))._id);
        console.log("BOOK 2 ID: ", (await Book.findOne({ isbn: '978-0134494166' }))._id);
        console.log("-----------------------------------------");
        console.log("Use these IDs in your Borrow Book POST request.");

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error creating test data:", err);
        process.exit(1);
    }
};

createTestData();
