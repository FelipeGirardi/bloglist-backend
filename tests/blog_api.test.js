const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const config = require('../utils/config')

beforeEach(async () => {
  const mongoUrl = config.MONGODB_URI
  await mongoose.connect(mongoUrl)
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog( { ...blog }))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
}, 100000)

describe('when there is initially some notes saved', () => {
  test('4.8 - notes are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000)

  test('4.9 - id property is called id', async () => {
    const blogs = await helper.blogsInDb()
    const firstBlog = blogs[0]

    expect(firstBlog.id).toBeDefined()
  }, 100000)

})

describe('when blog is added to db', () => {
  test('4.10 - blog was added to db', async () => {
    const newBlog = {
      title: 'Random Blog',
      author: 'Walter White',
      url: 'http://www.hello.com',
      likes: 10,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsInDb()
    expect(blogs).toHaveLength(helper.initialBlogs.length + 1)
    const title = blogs.map(n => n.title)
    expect(title).toContain(
      'Random Blog'
    )
  }, 100000)

  test('4.11 - if blog has no likes, it\'s set to 0', async () => {
    const newBlog = {
      title: 'Woohoo Blog',
      author: 'Woohoo',
      url: 'https://www.woohoo.com',
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)

    const blog = response.body
    expect(blog.likes).toBeDefined()
    expect(blog.likes).toBe(0)
  }, 100000)

  test('4.12 - if blog has no title, responds with 400', async () => {
    const newBlog = {
      author: 'Yay',
      url: 'https://www.yay.com',
      likes: 2
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  }, 100000)

  test('4.12 - if blog has no url, responds with 400', async () => {
    const newBlog = {
      title: 'Great Blog',
      author: 'Great',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  }, 100000)
})

describe('when blog is deleted db', () => {
  test('4.13 - blog was deleted from db', async () => {
    const blogs = await helper.blogsInDb()
    const id = blogs[0].id

    await api
      .delete(`/api/blogs/${id}`)
      .expect(204)
  }, 100000)
})

describe('when blog is updated in db', () => {
  test('4.14 - blog was updated in db', async () => {
    const blogs = await helper.blogsInDb()
    const firstBlog = blogs[0]
    const id = firstBlog.id
    const likes = firstBlog.likes
    const updatedBlog = {
      title: firstBlog.title,
      url: firstBlog.url,
      author: firstBlog.author,
      likes: firstBlog.likes + 1
    }
    await api
      .put(`/api/blogs/${id}`)
      .send(updatedBlog)
      .expect(204)

    const blogsInDB = await helper.blogsInDb()
    const blogJustUpdated = blogsInDB.find((blog) => blog.id === id)
    expect(blogJustUpdated.likes).toBe(likes + 1)
  }, 100000)
})

afterAll(async () => {
  await mongoose.connection.close()
})