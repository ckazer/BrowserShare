from twisted.web.server import Site
from twisted.web.resource import Resource
from twisted.internet import reactor
import json
import urllib

masterInfo = {"curURL": "http://cs.swarthmore.edu", "count": -1}

class Ping(Resource):
     isLeaf = True

     def render_POST(self, request):
         print 'Request is:', request

         request.setHeader('Access-Control-Allow-Origin', '*')
         #request.setHeader('Access-Control-Allow-Methods', 'POST')
         #request.setHeader('Access-Control-Allow-Origin', '*')
         #request.setHeader('Access-Control-Max-Age', 120)
         
         global masterInfo
         return json.dumps(masterInfo)

# TODO: Add server logic for URL reception.
class URL_Update(Resource):
     isLeaf = True

     def render_POST(self, request):
         print 'Request is:', request

         request.setHeader('Access-Control-Allow-Origin', '*')

         global masterInfo
         tokens = request.uri.split('?')[1]
         tokens = tokens.split('&')
         for element in range(len(tokens)):
             tokens[element] = urllib.unquote(tokens[element])
             print tokens[element]

         #This is messy, but it works. Try to clean up later?
         #tokens[0] is url=... tokens[1] is counter=...

         masterInfo["curURL"] = tokens[0][4:]
         masterInfo["count"] = tokens[1].split('=')[1]
         print "masterURL: " + masterInfo["curURL"]
         print "masterCount: " + masterInfo["count"]

         return '{ "message": true }'

root = Resource()
root.putChild("ping", Ping())
root.putChild("URL_update", URL_Update())

factory = Site(root)
reactor.listenTCP(8880, factory)
reactor.run()
