from twisted.web.server import Site
from twisted.web.resource import Resource
from twisted.internet import reactor

class Ping(Resource):
     isLeaf = True

     def render_POST(self, request):
         print 'Request is:', request
         return 'Ping from client!'

class Bar(Resource):
     isLeaf = True

     def render_POST(self, request):
         print 'Request is:', request
         return 'Hello, bar!'

root = Resource()
root.putChild("ping", Ping())
root.putChild("bar", Bar())

factory = Site(root)
reactor.listenTCP(8880, factory)
reactor.run()
