Todos:
1. Read more documentation on protractor and jasmine
2. How to integrate as part of a pipeline CI using Jenkins
3. Error handling
4. Each specifications into separate files
5. How to fix this message at the end of run 
E/launcher - BUG: launcher exited with 1 tasks remaining

Sept 24, 2019
- added function to write harfile to elasticsearch
- proved that retrieving har from elastic produces valid har file for har viewer. Eg
curl -s  -XPOST "http://localhost:9200/harfile/_search" -H 'Content-Type: application/json' -d'
  {
    "_source": ["har"],
     "query": {
       "match_all": {}
     }
  }' | jq '.hits.hits[0]._source.har' | sed -e 's/\\"/'\"'/g' | sed -e 's/^"//' -e 's/"$//' > har_from_elastic.har
  
Sept 23, 2019
- protractor script uses async/await, disabled promise manager
- writes har data to elastic

