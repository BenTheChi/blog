const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
	let blogs = await Blog.find({});
	response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
	if(!request.body.title || !request.body.url){
		response.status(404).send(null);
	} else {
		const blog = new Blog(request.body)

		let result = await blog.save();
		response.status(201).json(result)
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