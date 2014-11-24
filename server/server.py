from twisted.web.server import Site
from twisted.web.resource import Resource
from twisted.internet import reactor
import json

masterURL = {"curURL": "http://cs.swarthmore.edu"}

class Ping(Resource):
     isLeaf = True

     def render_POST(self, request):
         print 'Request is:', request

         request.setHeader('Access-Control-Allow-Origin', '*')
         #request.setHeader('Access-Control-Allow-Methods', 'POST')
         #request.setHeader('Access-Control-Allow-Origin', '*')
         #request.setHeader('Access-Control-Max-Age', 120)
         
         global masterURL
         return json.dumps(masterURL)

# TODO: Add server logic for URL reception.
class URL_Update(Resource):
     isLeaf = True

     def render_POST(self, request):
         print 'Request is:', request

         request.setHeader('Access-Control-Allow-Origin', '*')

         global masterURL
         masterURL["curURL"] = \
                 request.uri.split('url=')[1] #parses only the url
         print "masterURL: " + masterURL["curURL"]
         print "\n"

         return '{ "message": true }'

root = Resource()
root.putChild("ping", Ping())
root.putChild("URL_update", URL_Update())

factory = Site(root)
reactor.listenTCP(8880, factory)
reactor.run()
