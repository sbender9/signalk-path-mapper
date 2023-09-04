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

  function mapKPs(mappings, kps, key, source) {
    kps.forEach(pathValue => {
      mappings.forEach(mapping => {
        if (
          pathValue.path
            && (pathValue.path + '.').startsWith(mapping.path + '.')
            && (!mapping.source || mapping.source == source)
        ) {
          const newPath = mapping.newPath
                + pathValue.path.slice(mapping.path.length, pathValue.path.length)
          app.debug('%s %s from %s to %s', (!mapping.duplicate ? 'mapping' : 'duplicating'), key, pathValue.path, newPath)
          if ( !mapping.duplicate ) {
            pathValue.path = newPath
          } else {
            app.handleMessage(plugin.id, {
              updates: [
                {
                  values: [
                    {
                      path: newPath,
                      value: pathValue.value
                    }
                  ]
                }
              ]
            })
          }
        }
      })
    })
  }

  plugin.start = function(props) {
    if ( props.mappings && props.mappings.length > 0 ) {
      app.registerDeltaInputHandler((delta, next) => {
        if ( delta.updates ) {
          delta.updates.forEach(update => {
            if ( update.values  ) {
              mapKPs(props.mappings, update.values, 'value', update.$source)
            }
            if ( update.meta ) {
              mapKPs(props.mappings, update.meta, 'meta', update.$source)
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
              description: 'The Signal K path to map',
              default: 'electrical.switches.bank.0.1'
            },
            newPath: {
              type: 'string',
              title: 'New Path',
              description: 'The path to map it to'
            },
            source: {
              type: 'string',
              title: 'Source',
              description: 'The $source to map (i.e actisense.234)'
            },
            duplicate: {
              type: 'boolean',
              title: 'Duplicate',
              description: 'Duplicate the path instead of renaming it',
              default: false
            }
          }
        }
      }
    }
  }

  return plugin;
}
