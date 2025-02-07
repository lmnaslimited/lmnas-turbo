import BlogCard from "../components/BlogCard"

// This would typically come from a database or API
const blogPosts = [
  {
    title: "The Future of Cloud Computing",
    excerpt: "Explore the latest trends and innovations in cloud technology...",
    date: "2023-06-01",
    slug: "future-of-cloud-computing",
  },
  {
    title: "Securing Your Cloud Infrastructure",
    excerpt: "Learn best practices for maintaining a secure cloud environment...",
    date: "2023-05-15",
    slug: "securing-cloud-infrastructure",
  },
  {
    title: "Optimizing Cloud Costs",
    excerpt: "Discover strategies to reduce your cloud spending without compromising performance...",
    date: "2023-04-30",
    slug: "optimizing-cloud-costs",
  },
]

export default function Blog() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <BlogCard key={post.slug} {...post} />
        ))}
      </div>
    </div>
  )
}

