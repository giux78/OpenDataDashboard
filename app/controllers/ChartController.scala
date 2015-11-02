package controllers

import play.api._
import play.api.mvc._
import com.mongodb.casbah.MongoClient
import com.mongodb.casbah.Imports._
import scala.collection.mutable.ListBuffer
import play.api.libs.json.JsValue
import play.api.libs.json.Json

object ChartController extends Controller {

  def chart_titles = Action {
    val mongoClient = MongoClient("localhost", 27017)
    val db = mongoClient("meta_ckan")
    val coll = db("dashboard_chart")
    val query = MongoDBObject.empty
    val fields = MongoDBObject("dataset_title" -> 1, "dataset_name" -> 1, "_id" -> 0)
    var results = new ListBuffer[JsValue]()
    for (x <- coll.find(query, fields)) {
      results += Json.parse(x.toString())
    }
    mongoClient.close
    Ok(Json.obj("status" -> "ok", "results" -> results))
  }

  def chartsFromName(name: String) = Action {
    val mongoClient = MongoClient("localhost", 27017)
    val db = mongoClient("meta_ckan")
    val coll = db("dashboard_chart")
    val datasets = coll.find("dataset_name" $eq name)
    var results = new ListBuffer[JsValue]()
    for (x <- datasets) {
      results += Json.parse(x.toString())
    }
    mongoClient.close
    Ok(Json.obj("status" -> "ok", "results" -> results))
  }
  
  def saveDashboard = Action { request =>
      val body: AnyContent = request.body
      val jsonBody: Option[JsValue] = body.asJson 
      val json: JsValue = jsonBody.get
      println(json)
      Ok(Json.stringify(json))
    }
}