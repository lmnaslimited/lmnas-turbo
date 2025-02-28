const testimonials = [
  {
    content: "StreamLine has revolutionized our team's workflow. We're more productive than ever!",
    author: "Sarah Johnson",
    role: "Project Manager, TechCorp",
  },
  {
    content: "The analytics features have given us invaluable insights into our project performance.",
    author: "Mike Chen",
    role: "CTO, InnovateTech",
  },
  {
    content: "Seamless collaboration and top-notch security make StreamLine a must-have for any serious team.",
    author: "Emily Rodriguez",
    role: "Team Lead, SecureData Solutions",
  },
]

export default function Testimonials() {
  return (
    <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:py-16 lg:px-8" id="testimonials">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">What our customers are saying</h2>
        <div className="grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-6">
              <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

