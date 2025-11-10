import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
      exports: "named",
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: [".js", ".jsx"],
    }),
    commonjs(),
    babel({
      exclude: "node_modules/**",
      presets: [
        [
          "@babel/preset-react",
          {
            runtime: "automatic", // ← This is the key!
          },
        ],
      ],
      babelHelpers: "bundled",
      extensions: [".js", ".jsx"],
    }),
  ],
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime", // ← Important: mark as external
    "react-router-dom",
    "@mui/material",
    "@mui/icons-material",
    "@emotion/react",
    "@emotion/styled",
    "react-window",
  ],
};
