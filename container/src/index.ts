// Entry point must stay a thin async boundary: Module Federation needs to
// resolve/negotiate shared singletons (react, react-dom, ...) *before* any
// module that imports them executes. Importing `./bootstrap` synchronously
// here would race that negotiation.
import('./bootstrap');
