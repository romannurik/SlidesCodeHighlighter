(ns one.namespace
  (:require
   [taoensso.timbre :as timbre :refer [debug error]]))

(defn
  "This is a code example"
  [param & {:keys [a] b :b :as opts}]
  (println "Hello world")
  # A comment
  (let [param @param]
    (case param
      :hello "World"
      :broken_underscore 3.14
      :and/namespaces 'too
      (when param
        (timbre/error (:b opts))))))
