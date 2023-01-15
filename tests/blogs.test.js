const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const app = require('../app.js')

const api = supertest(app);

const blogs = [
	{
		title: "React patterns",
		author: "Michael Chan",
		url: "https://reactpatterns.com/",
		likes: 7,
		__v: 0
	},
	{
		title: "Go To Statement Considered Harmful",
		author: "Edsger W. Dijkstra",
		url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
		likes: 5,
		__v: 0
	},
	{
		title: "Canonical string reduction",
		author: "Edsger W. Dijkstra",
		url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
		likes: 12,
		__v: 0
	},
	{
		title: "First class tests",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
		likes: 10,
		__v: 0
	},
	{
		title: "TDD harms architecture",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
		likes: 0,
		__v: 0
	},
	{
		title: "Type wars",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
		likes: 2,
		__v: 0
	}  
]

describe('blog tests', () => {
	beforeEach(async () => {
		console.log('initializing DB');

		blogs.forEach(async (blog) => {
			let blogObj = new Blog(blog);
			await blogObj.save();
		})

		console.log('done');
	});

	afterEach(async () => {
		await Blog.deleteMany({});
	})

	test('blogs are returned as json', async () => {
		await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})

	test('blogs have id', async () => {
		const response = await api.get('/api/blogs');

		response.body.forEach(blog => {
			expect(blog.id).toBeDefined();
		})
	})

	test('creates a new blog post', async () => {
		let newObj = {
			title: "A new blog post",
			author: "Ben Chi",
			url: "https://anewblogpost.com/",
			likes: 5,
			__v: 0
		};

		await api
			.post('/api/blogs')
			.send(newObj)

			
		let dbResult = await Blog.find({title: "A new blog post"});

		expect(dbResult).toBeDefined();
	})

	test('if no likes defaults to 0', async () => {
		let newObj = {
			title: "A new blog post",
			author: "Ben Chi",
			url: "https://anewblogpost.com/",
			__v: 0
		};

		await api
			.post('/api/blogs')
			.send(newObj)

		let dbResult = await Blog.find({title: "A new blog post"});

		expect(dbResult[0].likes).toBe(0);
	})

	test('if no title or url returns 404', async () => {
		let newObj = {
			url: "https://anewblogpost.com/",
			__v: 0
		};

		await api
			.post('/api/blogs')
			.send(newObj)
			.expect(404)
	})

	test('if deleting works', async () => {
		await api
			.delete('/api/blogs')
			.send({title: 'First class tests'})
			.expect(204)
	})

	test('if updating works', async () => {
		let newObj = {
			title: "First class tests",
			author: "Test man",
			url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
			likes: 100} 

		await api
			.put('/api/blogs/First class tests')
			.send(newObj)		
		
		let dbResult = await Blog.find({title: 'First class tests'});

		expect(dbResult[0].likes).toBe(100);
		expect(dbResult[0].author).toBe("Test man");
	})
})