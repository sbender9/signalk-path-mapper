# signalk-path-mapper
SignalK Node Server Plugin that maps the paths of incoming Signal K deltas to different paths

Mapping a tree of paths, without having to enter each individual full path, is also possible. For example, set "Path" to "propulsion.3" and "New Path" to "propulsion.generator.0", check "duplicate" if you want to, and all paths in propulsion.3.* will automatically also pop up in propulsion.generator.0.*
