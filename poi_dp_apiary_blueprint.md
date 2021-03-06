FORMAT: 1A
HOST: http://fiwarepoi.apiblueprint.org/

# Fiware_POI_R4

Fiware Points of Interest Generic Enabler R4

# Group Platform

## Get Components [GET /get_components]

Return the list of POI data components available from this server.

+ Response 200 (application/json)

        {
          "components": [
            "fw_core"
          ]
        }
        
# Group Query

## Radial Search [GET /radial_search]

Return the data of POIs within a given distance from a given location.

+ Parameters
  + lat (number, required) - Latitude of the center of the search circle [degrees]
  + lon (number, required) - Longitude of the center of the search circle [degrees]
  + radius (number, optional) - Radius of the search circle [meters], default is implementation dependent
  + category (string, optional) - POI category/categories to be included to results. Several categories can be given by separating them with commas. If this parameter is not given, all categories are included.
  + component (string, optional) - POI data component names to be included to results. Several component names can be given by separating them with commas. If this parameter is not given, all components are included.
  + max_results (number, optional) - Maximum number of POIs returned.
  + begin_time (string, optional) - When time of interest begins. ISO 8601 adaptation format is used for times. However, it is allowed to leave the time zone definition out. If time zone is missing, the local time zone of the POI is used. 
  + end_time (string, optional) - When time of interest ends. Format as for begin_time. Required, if begin_time is defined.
  + min_minutes (number, optional) - Minimum time of availability in minutes. Optional. If begin_time is defined, default: a short time > 0.

+ Response 200 (application/json)

        {
          "pois": {
            "6be4752b-fe6f-4c3a-98c1-13e5ccf01721": {
              "fw_core": {
                "category": "cafe", 
                "location": {
                  "wgs84": { 
                    "latitude": 65.059334, 
                    "longitude": 25.4664775
                  }
                }, 
                "name": {
                  "": "Aulakahvila"
                }
              }
            }, 
            "4c6754d9-0bb1-4962-b604-6f3fcc08a9ec": {
              "fw_core": {
                "category": "restaurant",
                "location": {
                  "wgs84": { 
                    "latitude": 65.0581807, 
                    "longitude": 25.4667163
                  }
                }, 
                "name": {
                  "": "Discus"
                }
              }
            }
          }
        }

## Bounding Box Search [GET /bbox_search]

Return the data of POIs within a given bounding box.

+ Parameters
  + north (number, required) - Latitude of the northern edge of the bounding box [degrees]
  + south (number, required) - Latitude of the southern edge of the bounding box [degrees]
  + east (number, required) - Longitude of the eastern edge of the bounding box [degrees]
  + west (number, required) - Longitude of the western edge of the bounding box [degrees]
  + category (string, optional) - POI category/categories to be included to results. Several categories can be given by separating them with commas. If this parameter is not given, all categories are included.
  + component (string, optional) - POI data component names to be included to results. Several component names can be given by separating them with commas. If this parameter is not given, all components are included.
  + max_results (number, optional) - Maximum number of POIs returned.
  + begin_time (string, optional) - When time of interest begins. ISO 8601 adaptation format is used for times. However, it is allowed to leave the time zone definition out. If time zone is missing, the local time zone of the POI is used. 
  + end_time (string, optional) - When time of interest ends. Format as for begin_time. Required, if begin_time is defined.
  + min_minutes (number, optional) - Minimum time of availability in minutes. Optional. If begin_time is defined, default: a short time > 0.
+ Response 200 (application/json)

        {
          "pois": {
            "6be4752b-fe6f-4c3a-98c1-13e5ccf01721": {
              "fw_core": {
                "category": "cafe", 
                "location": {
                  "wgs84": { 
                    "latitude": 65.059334, 
                    "longitude": 25.4664775
                  }
                }, 
                "name": {
                  "": "Aulakahvila"
                }
              }
            }, 
            "4c6754d9-0bb1-4962-b604-6f3fcc08a9ec": {
              "fw_core": {
                "category": "restaurant",
                "location": {
                  "wgs84": { 
                    "latitude": 65.0581807, 
                    "longitude": 25.4667163
                  }
                }, 
                "name": {
                  "": "Discus"
                }
              }
            }
          }
        }

## Get POIs [GET /get_pois]

Return the data of POIs listed in the query. This is intended to get additional information - other components - about interesting POIs.

+ Parameters
  + poi_id (string, required) - UUID of the POI. Several UUIDs can be given by separating them with commas.
  + component (string, optional) - POI data component names to be included to results. Several component names can be given by separating them with commas. If this parameter is not given, all components are included.
  + get_for_update (boolean, optional) - The components requested are returned with all language and other variants and possible metadata for inspection and edit.

+ Response 200 (application/json)

        {
          "pois": {
            "30ddf703-59f5-4448-8918-0f625a7e1122": {
              "fw_core": {
                "category": "cafe", 
                "location": {
                  "wgs84" { 
                    "latitude": 65.059334, 
                    "longitude": 25.4664775
                  }
                }, 
                "name": {
                  "": "Aulakahvila"
                }
              }
            } 
          }
        }

# Group Update

Update operations should require authorization in order to prevent misuse. The details of the authorization mechanism are out of the scope of this specification.

## Add POI [POST /add_poi]
This function is used for adding a new POI entity into a database. The POI data is given as JSON in HTTP POST request. It generates a UUID for the new POI and returns it to the client in JSON format including the timestamp of the POI creation. The client can include different data components to the new POI by sending them along with the request.

The POSTed JSON must include only the content of a single POI, i.e. it must not contain a UUID as key as it is automatically generated by the server.

+ Request (application/json)

        {
          "fw_core": {
          "category": "cafe", 
          "location": {
            "wgs84" { 
            "latitude": 65.059334, 
            "longitude": 25.4664775
            }
          }, 
          "name": {
            "": "Aulakahvila"
          }
          }
        }

+ Response 200 (application/json)

        {
          "created_poi": {
            "uuid": "30ddf703-59f5-4448-8918-0f625a7e1122",
          "timestamp": 1394525977
          }
        }
        
## Update POI [POST /update_poi]
This function is used for updating data of an existing POI entity. Existing data components can be modified or new ones can be added. Each data component contains a ‘last modified’ timestamp in order to prevent concurrency issues.

The updated POI data is given as JSON in HTTP POST request. The server responds with HTTP status messages indicating the success or failure of the operation.

+ Request (application/json)

        { 
          "30ddf703-59f5-4448-8918-0f625a7e1122": {
            "fw_core": {
            "category": "cafe", 
            "location": {
              "wgs84" { 
              "latitude": 65.059334, 
              "longitude": 25.4664775
              }
              }, 
            "name": {
              "": "Aulakahvila"
            },
            "description": {
              "": "Cafe at the Univesity of Oulu"
              }
            }
          }
        }

+ Response 200 (text/plain)

        POI data updated succesfully
        
## Delete POI [DELETE /delete_poi]

Delete existing POI using HTTP DELETE request. The UUID of the POI to be deleted is given in the request as a URL parameter

+ Parameters
  + id (string, required) - The UUID of the POI to be deleted

+ Response 200 (text/plain)

        POI entity deleted succesfully
        
