package controllers

import play.api._
import play.api.mvc._

object Application extends Controller {

  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }
  
    def home = Action {
    Ok(views.html.home("OpenData Dashboard"))
  }

}