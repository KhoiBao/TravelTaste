import com.reviewdiadiem.service.CommentService;
import com.reviewdiadiem.repository.DiaDiemRepository;
import com.reviewdiadiem.model.*;
import com.reviewdiadiem.exception.ApiException;
import com.reviewdiadiem.controller.api.CommentApiController;
import java.lang.reflect.Proxy;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/** No database: verifies deletion permissions on both root and nested comments. */
public class VerifyCommentPermissions {
    private static int checks;
    private static void check(String actor, boolean admin, String target, boolean allowed) {
        var root = new BinhLuan(); root.setCommentId("root"); root.setUserId("owner-root");
        var child = new BinhLuan(); child.setCommentId("child"); child.setUserId("owner-child"); child.setTraLoi(new ArrayList<>());
        root.setTraLoi(new ArrayList<>(List.of(child)));
        var review = new Review(); review.setReviewId("review"); review.setBinhLuan(new ArrayList<>(List.of(root)));
        var place = new DiaDiem(); place.setId("place"); place.setReviews(new ArrayList<>(List.of(review)));
        var writes = new AtomicInteger();
        var repository = (DiaDiemRepository) Proxy.newProxyInstance(DiaDiemRepository.class.getClassLoader(), new Class<?>[]{DiaDiemRepository.class}, (proxy, method, args) -> {
            if (method.getName().equals("findById")) return Optional.of(place);
            if (method.getName().equals("save")) {writes.incrementAndGet(); return args[0];}
            throw new UnsupportedOperationException(method.getName());
        });
        var service = new CommentService(repository, null);
        try {
            service.deleteComment("place", "review", target, actor, admin);
            if (!allowed || writes.get() != 1) throw new AssertionError("Unexpected delete permission: " + actor + "/" + target);
        } catch (ApiException error) {
            if (allowed || error.getStatus().value() != 403 || writes.get() != 0) throw new AssertionError("Expected forbidden without writes", error);
            if (review.getBinhLuan().size() != 1 || root.getTraLoi().size() != 1) throw new AssertionError("Unauthorized delete mutated the tree");
        }
        checks++;
    }
    public static void main(String[] args) {
        check("stranger", false, "root", false);
        check("stranger", false, "child", false);
        check("owner-root", false, "child", false);
        check("owner-child", false, "root", false);
        check("owner-root", false, "root", true);
        check("owner-child", false, "child", true);
        check("administrator", true, "root", true);
        check("administrator", true, "child", true);
        if (Arrays.stream(CommentApiController.class.getDeclaredMethods()).anyMatch(m -> m.isAnnotationPresent(org.springframework.web.bind.annotation.PutMapping.class) && Arrays.asList(m.getAnnotation(org.springframework.web.bind.annotation.PutMapping.class).value()).contains("/{commentId}"))) throw new AssertionError("Comment edit endpoint still exists");
        if (Arrays.stream(CommentService.class.getDeclaredMethods()).anyMatch(m -> m.getName().startsWith("updateComment"))) throw new AssertionError("Comment edit service still exists");
        System.out.println("PASS: " + checks + " owner/admin permission cases; no edit API/service; no database writes");
    }
}
