import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
export default {input:"src/panel.ts",output:{file:"../custom_components/roborock_companion/frontend/roborock-companion-panel.js",format:"es",sourcemap:true},plugins:[resolve({browser:true}),typescript()]};
