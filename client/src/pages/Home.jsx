import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Clock, MapPin, Star, Calendar, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Skip the Wait,<br />
              <span className="text-yellow-300">Book Your Cut!</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              No more waiting in long queues. Book your barber appointment online 
              and see real-time queue updates.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/shops" 
                className="btn btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg"
              >
                Find Nearby Barbers
              </Link>
              <Link 
                to="/register" 
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose SmartQueue?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing the barber shop experience with smart technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Queue</h3>
              <p className="text-gray-600">
                See live queue status and estimated wait times before you leave home
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Booking</h3>
              <p className="text-gray-600">
                Book your slot in advance and get confirmation instantly
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Find Nearby</h3>
              <p className="text-gray-600">
                Discover top-rated barber shops in your area with reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Partner Shops</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">30min</div>
              <div className="text-gray-600">Average Wait Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">5★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Getting your perfect haircut is now just 3 steps away
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose Your Barber</h3>
              <p className="text-gray-600">
                Browse nearby barber shops, check reviews, and see current queue status
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Book Your Slot</h3>
              <p className="text-gray-600">
                Select your preferred time, services, and get instant confirmation
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Arrive & Check-in</h3>
              <p className="text-gray-600">
                Show your QR code, skip the wait, and enjoy your service
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Skip the Queue?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of customers who have saved time with SmartQueue
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Start Booking Now
            </Link>
            <Link 
              to="/shops" 
              className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg"
            >
              Browse Barbers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
