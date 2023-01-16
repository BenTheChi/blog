const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app.js')
const helper = require('./test_helper')
const api = supertest(app);



describe('blog tests', () => {
	beforeEach(async () => {
		await Blog.deleteMany({});
		console.log('initializing DB');

		for(const blog of helper.initialBlogs){
			let blogObj = new Blog(blog);
			await blogObj.save();
		}

		console.log('done');
	});

	test('blogs are returned as json', async () => {
		await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})

	test('all notes are returned', async () => {
		console.log(helper.initialBlogs.length);
		const response = await api.get('/api/blogs')
	
		expect(response.body).toHaveLength(helper.initialBlogs.length)
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

describe('when there is initially one user in db', () => {
	beforeEach(async () => {
		await User.deleteMany({})

		const passwordHash = await bcrypt.hash('sekret', 10)
		const user = new User({ username: 'root', name: 'admin', passwordHash })

		await user.save()
	})
  
	test('creation succeeds with a fresh username', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'mluukkai',
			name: 'Matti Luukkainen',
			password: 'salainen',
		}
  
		await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)
  
		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

		const usernames = usersAtEnd.map(u => u.username)
		expect(usernames).toContain(newUser.username)
	})

	test('creation fails with proper statuscode and message if username already taken', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'root',
			name: 'Superuser',
			password: 'salainen',
		}
	
		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('username must be unique')
	
		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})
})