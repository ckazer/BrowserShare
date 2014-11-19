from twisted.web.server import Site
from twisted.web.resource import Resource
from twisted.internet import reactor

masterURL = ""

class Ping(Resource):
     isLeaf = True

     def render_POST(self, request):
         print 'Request is:', request

         global masterURL
         masterURL = request.uri.split('?')[1][1:] #parses only the url
         print "masterURL: " + masterURL

         request.setHeader('Access-Control-Allow-Origin', '*')
         #request.setHeader('Access-Control-Allow-Methods', 'POST')
         #request.setHeader('Access-Control-Allow-Origin', '*')
         #request.setHeader('Access-Control-Max-Age', 120)
         
         return 'Ping from client!'

class URL_Update(Resource):
     isLeaf = True

     def render_POST(self, request):
         print 'Request is:', request

         request.setHeader('Access-Control-Allow-Origin', '*')

         return 'Request to update URL.'

root = Resource()
root.putChild("ping", Ping())
root.putChild("URL_update", URL_Update())

factory = Site(root)
reactor.listenTCP(8880, factory)
reactor.run()
