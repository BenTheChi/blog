const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
	const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		return authorization.substring(7)
	}
	return null
}

blogsRouter.get('/', async (request, response) => {
	let blogs = await Blog.find({}).populate('user', {username: 1, name: 1});
	response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
	if(!request.body.title || !request.body.url){
		response.status(404).send(null);
	} else {
		const token = getTokenFrom(request)
		const decodedToken = jwt.verify(token, process.env.SECRET)
		if (!decodedToken.id) {
			return response.status(401).json({ error: 'token missing or invalid' })
		}
		const user = await User.findById(decodedToken.id)
		
		let blogObj = request.body;
		blogObj.user = user._id;

		const blog = new Blog(blogObj)
		let savedBlog = await blog.save();

		user.blogs = user.blogs.concat(savedBlog._id)
		await user.save();

		response.status(201).json(savedBlog)
	}
})

blogsRouter.delete('/', async (request, response) => {
	await Blog.deleteOne({title: request.body.title})
	response.status(204).end();
})

blogsRouter.put('/:title', async (request, response) => {

	Blog.findOneAndUpdate({title: request.params.title}, request.body, { new: true, context: 'query' })
		.then(updatedBlog => {
			response.json(updatedBlog)
		})
})

module.exports = blogsRouter