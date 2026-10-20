import com.mongodb.client.*;
import org.bson.Document;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class IntegrationFixture {
 public static void main(String[] args) {
  try(var client=MongoClients.create("mongodb://127.0.0.1:27028")) {
   var db=client.getDatabase("traveltaste_integration");
   if(db.getCollection("users").countDocuments(new Document("username","integration_admin"))==0)
    db.getCollection("users").insertOne(new Document("username","integration_admin").append("hoTen","Integration Admin").append("email","integration_admin@example.test").append("passwordHash",new BCryptPasswordEncoder().encode(System.getenv().getOrDefault("TEST_PASSWORD", "Integration123"))).append("role","ADMIN").append("trangThai","ACTIVE"));
   db.getCollection("diadiem").createIndex(new Document("viTri","2dsphere"));
   db.getCollection("users").createIndex(new Document("username",1),new com.mongodb.client.model.IndexOptions().unique(true));
   db.getCollection("users").createIndex(new Document("email",1),new com.mongodb.client.model.IndexOptions().unique(true));
   System.out.println("Isolated integration fixture ready");
  }
 }
}
