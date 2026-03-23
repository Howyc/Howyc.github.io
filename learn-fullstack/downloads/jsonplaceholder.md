# JSONPlaceholder - Free Fake REST API

[Check my new project **💧 MistCSS** write React components with 50% less code](https://github.com/typicode/mistcss)

## JSONPlaceholder

*   [Guide](/guide)
*   [Sponsor this project](https://github.com/sponsors/typicode)
*   [Blog](https://blog.typicode.com)
*   [My JSON Server](https://my-json-server.typicode.com)

## {JSON} Placeholder

### Free fake and reliable API for testing and prototyping.

Powered by [JSON Server](https://github.com/typicode/json-server) + [LowDB](https://github.com/typicode/lowdb).

**Serving ~3 billion requests each month**.

---

## Sponsors

JSONPlaceholder is supported by the following companies and [Sponsors](https://github.com/sponsors/typicode) on GitHub, check them out 💖

- [Mockend](https://mockend.com)
- [Zuplo](https://zuplo.link/json-server-web)
- [Your company logo here](https://github.com/sponsors/typicode)

---

## Try it

Run this code here, in a console or from any site:

```javascript
fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => response.json())
  .then(json => console.log(json))
```

Congrats! You've made your first call to JSONPlaceholder. 😃 🎉

---

## When to use

JSONPlaceholder is a free online REST API that you can use **whenever you need some fake data**. It can be in a README on GitHub, for a demo on CodeSandbox, in code examples on Stack Overflow, ...or simply to test things locally.

---

## Resources

JSONPlaceholder comes with a set of 6 common resources:

| Resource | Count |
|----------|-------|
| [/posts](https://jsonplaceholder.typicode.com/posts) | 100 posts |
| [/comments](https://jsonplaceholder.typicode.com/comments) | 500 comments |
| [/albums](https://jsonplaceholder.typicode.com/albums) | 100 albums |
| [/photos](https://jsonplaceholder.typicode.com/photos) | 5000 photos |
| [/todos](https://jsonplaceholder.typicode.com/todos) | 200 todos |
| [/users](https://jsonplaceholder.typicode.com/users) | 10 users |

**Note**: resources have relations. For example: posts have many comments, albums have many photos, ... see [guide](/guide) for the full list.

---

## Routes

All HTTP methods are supported. You can use http or https for your requests.

| Method | Endpoint |
|--------|----------|
| GET | [/posts](https://jsonplaceholder.typicode.com/posts) |
| GET | [/posts/1](https://jsonplaceholder.typicode.com/posts/1) |
| GET | [/posts/1/comments](https://jsonplaceholder.typicode.com/posts/1/comments) |
| GET | [/comments?postId=1](https://jsonplaceholder.typicode.com/comments?postId=1) |
| POST | /posts |
| PUT | /posts/1 |
| PATCH | /posts/1 |
| DELETE | /posts/1 |

**Note**: see [guide](/guide) for usage examples.

---

## Use your own data

With our sponsor [Mockend](https://mockend.com) and a simple GitHub repo, you can have your own fake online REST server in seconds.

---

[**You can sponsor this project (and others) on GitHub**](https://github.com/users/typicode/sponsorship)

Coded and maintained with ❤️ by [typicode](https://github.com/typicode) © 2024

---

*Downloaded via MCP fetch_markdown*
*Source: https://jsonplaceholder.typicode.com*
