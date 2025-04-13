import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Books from "../models/bookSchema.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();


router.post("/", verifyToken, async(req, res) => {
    try {

        const { title, caption, image, rating } = req.body;

        if (!title || !caption || !image || !rating) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // upload image to cloudinary

        const bookImage = await cloudinary.uploader.upload(image, {
            folder: "books"
        });

        const imageUrl = bookImage.secure_url;

        const book =  new Books({
            title,
            caption,
            image: imageUrl,
            rating,
            user: req.user._id
        });

        await book.save();

        res.status(201).json({ message: "Book added successfully",
            book
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.get("/", async(req, res) => {
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Books.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("username", "profileImage").exec();


        if (!books) {
            return res.status(404).json({ message: "No books found" });
        }

        const totalBooks = await Books.countDocuments();

        const totalPages = Math.ceil(totalBooks / limit);
        if (page > totalPages) {
            return res.status(404).json({ message: "No more books found" });
        }

        return res.status(200).json({
            message: "Books fetched successfully",
            books,
            currentPage: page,
            totalBooks,
            totalPages,
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
        
    }
})

router.get("/user", verifyToken, async(req, res) => {
    try {

        const books = await Books.find({ user: req.user._id }).sort({ createdAt: -1 }).exec();

        if (!books) {
            return res.status(404).json({ message: "No books found" });
        }

        res.status(200).json({ message: "Books fetched successfully", books })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
        
    }
})

router.delete("/:id", verifyToken, async(req, res) => {
    try {

        const { id } = req.params;

        const book = await Books.findById(id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // delete image from cloudinary
        const imageId = book.image.split("/").pop().split(".")[0];

        await cloudinary.uploader.destroy(imageId);

        await book.deleteOne();

        res.status(200).json({ message: "Book deleted successfully" })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})


export default router;