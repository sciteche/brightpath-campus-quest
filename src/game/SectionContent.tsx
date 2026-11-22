import { COURSES, RESULTS, TEACHERS, getMonthlyFee, type CampusSectionId } from "./content";
import { DemoEnquiryForm } from "./DemoEnquiryForm";

export function SectionContent({ section }: { section: CampusSectionId }) {
  if (section === "courses") {
    return (
      <div className="course-list">
        {COURSES.map((course, index) => (
          <article className="course-row" key={course.name}>
            <span className="course-number">0{index + 1}</span>
            <div className="course-copy">
              <h3>{course.name}</h3>
              <p>{course.level}</p>
              <small>{course.detail}</small>
            </div>
            <p className="course-price">
              <strong>{getMonthlyFee(course.price)}</strong>
              <span>/ month</span>
            </p>
          </article>
        ))}
      </div>
    );
  }

  if (section === "results") {
    return (
      <div className="results-grid">
        {RESULTS.map((result) => (
          <div className="result-stat" key={result.label}>
            <strong>{result.value}</strong>
            <span>{result.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (section === "faculty") {
    return (
      <div className="teacher-list">
        {TEACHERS.map((teacher, index) => (
          <article className="teacher-row" key={teacher.name}>
            <span className={`teacher-avatar teacher-avatar-${index + 1}`} aria-hidden="true">
              {teacher.initials}
            </span>
            <div>
              <h3>{teacher.name}</h3>
              <p>{teacher.subject}</p>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (section === "fees") {
    return (
      <div className="fee-table-wrap">
        <table className="fee-table">
          <caption>Monthly tuition</caption>
          <thead>
            <tr>
              <th scope="col">Course</th>
              <th scope="col">Class</th>
              <th scope="col">Fee</th>
            </tr>
          </thead>
          <tbody>
            {COURSES.map((course) => (
              <tr key={course.name}>
                <th scope="row">{course.name}</th>
                <td>{course.level}</td>
                <td>
                  {getMonthlyFee(course.price)} <span>/ month</span>
                </td>
              </tr>
            ))}
            <tr className="fee-free-row">
              <th scope="row">First demo class</th>
              <td>All classes</td>
              <td>Free</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return <DemoEnquiryForm />;
}
