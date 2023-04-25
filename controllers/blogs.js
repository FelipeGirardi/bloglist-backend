const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  if (request.body.title === undefined) {
    return response.status(400).send('No title')
  }

  if (request.body.url === undefined) {
    return response.status(400).send('No URL')
  }

  const blog = new Blog(request.body)

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const updatedBlog = {
    title: body.title,
    url: body.url,
    author: body.author,
    likes: body.likes
  }

  const updatedBlogResponse = await Blog.findByIdAndUpdate(
    request.params.id,
    updatedBlog,
    { new: true, runValidators: true, context: 'query' }
  )

  response.status(204).json(updatedBlogResponse)
})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'Not found' })
  }

  blog.remove()
    .then(() => response.status(204).end())
    .catch(() => response.status(404).end())
})

module.exports = blogsRouter