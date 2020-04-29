/*
 * Copyright 2019 Scott Bender <scott@scottbender.net>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function(app) {
  var plugin = {};
  var unsubscribes = []

  plugin.start = function(props) {
    if ( props.mappings && props.mappings.length > 0 ) {
      app.registerDeltaInputHandler((delta, next) => {
        if ( delta.updates ) {
          delta.updates.forEach(update => {
            if ( update.values  ) {
              let newValues = []
              update.values.forEach(pathValue => {
                props.mappings.forEach(mapping => {
                  if ( pathValue.path && pathValue.path.startsWith(mapping.path) ) {
                    const newPath = mapping.newPath
                      + pathValue.path.slice(mapping.path.length, pathValue.path.length)
                    app.debug('mapping to %s to %s', pathValue.path, newPath)
                    pathValue.path = newPath
                  }
                })
              })
            }
          })
        }
        next(delta)
      })
    }
  }

  plugin.stop = function() {
    unsubscribes.forEach(f => f())
    unsubscribes = []
  }

  plugin.id = "signalk-path-mapper"
  plugin.name = "Path Mapper"
  plugin.description = "SignalK Node Server Plugin that maps the paths of incoming Signal K deltas to different paths"

  plugin.schema = {
    type: "object",
    properties: {
      mappings: {
        type: "array",
        title: "Mappings",
        items: {
          type: "object",
          required: [ 'path', 'newPath' ],
          properties: {
            path: {
              type: 'string',
              title: 'Path',
              description: 'The full Signal K path to map',
              default: 'electrical.switches.bank.0.1'
            },
            newPath: {
              type: 'string',
              title: 'New Path',
              description: 'The path to map it to'
            }
          }
        }
      }
    }
  }

  return plugin;
}
