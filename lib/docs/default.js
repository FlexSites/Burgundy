
import { capitalize, pluralize, camel } from '../string-util';

export function pathTemplate(obj) {
  return JSON.parse(`{
    "/${pluralize(obj.identity)}": {
      "get": {
        "tags": [ "${pluralize(camel(obj.identity))}" ],
        "summary": "List ${camel(camel(obj.tableName))} object in ${capitalize(obj.connection)}",
        "responses": {
          "200": {
            "description": "Successfully retrieved list of ${camel(obj.identity)}",
            "schema": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/${camel(obj.identity)}"
              }
            }
          }
        }
      },
      "post": {
        "tags": [ "${pluralize(camel(obj.identity))}" ],
        "summary": "Create new ${camel(obj.tableName)} object in ${camel(obj.connection)}",
        "responses": {
          "201": {
            "description": "Successfully created ${camel(obj.identity)}",
            "schema": {
              "type": "object",
              "$ref": "#/definitions/${camel(obj.identity)}"
            }
          }
        },
        "parameters": [
          {
            "name": "data",
            "description": "Filter results based on a criterion",
            "in": "body",
            "schema": {
              "type": "object",
              "$ref": "#/definitions/${camel(obj.identity)}"
            }
          }
        ]
      }
    },
    "/${pluralize(obj.identity)}/{id}": {
      "get": {
        "tags": [ "${pluralize(camel(obj.identity))}" ],
        "summary": "List ${camel(obj.tableName)} object in ${capitalize(obj.connection)}",
        "responses": {
          "200": {
            "description": "Successfully retrieved list of ${camel(obj.identity)}",
            "schema": {
              "$ref": "#/definitions/${camel(obj.identity)}"
            }
          }
        }
      },
      "put": {
        "tags": [ "${pluralize(camel(obj.identity))}" ],
        "summary": "Create new ${camel(obj.tableName)} object in ${capitalize(obj.connection)}",
        "responses": {
          "201": {
            "description": "Successfully created ${camel(obj.identity)}",
            "schema": {
              "type": "object",
              "$ref": "#/definitions/${camel(obj.identity)}"
            }
          }
        },
        "parameters": [
          {
            "name": "data",
            "description": "Filter results based on a criterion",
            "in": "body",
            "schema": {
              "type": "object",
              "$ref": "#/definitions/${camel(obj.identity)}"
            }
          }
        ]
      },
      "patch": {
        "tags": [ "${pluralize(camel(obj.identity))}" ],
        "summary": "Updates fields in ${camel(obj.tableName)} object in ${capitalize(obj.connection)}",
        "responses": {
          "200": {
            "description": "Successfully updated ${camel(obj.identity)}",
            "schema": {
              "type": "object",
              "$ref": "#/definitions/${camel(obj.identity)}"
            }
          }
        },
        "parameters": [
          {
            "name": "data",
            "description": "Filter results based on a criterion",
            "in": "body",
            "schema": {
              "type": "object",
              "$ref": "#/definitions/${camel(obj.identity)}"
            }
          }
        ]
      }
    }
  }`);
}
