import Card from '../Card';
import './About.css';

const About = () => {
  return (
    <div className="section-content">
      <Card title="Sobre mí">
        <p>
          Soy un desarrollador full-stack apasionado por crear soluciones innovadoras y
          eficientes. Con más de 5 años de experiencia en el desarrollo web, me especializo
          en tecnologías modernas como React, Node.js, y bases de datos tanto relacionales
          como NoSQL.
        </p>
        <p>
          Mi enfoque se centra en escribir código limpio, mantenible y escalable, siempre
          buscando las mejores prácticas y las últimas tendencias en desarrollo de software.
        </p>
      </Card>

      <div className="experience-section">
        <Card title="Experiencia Profesional">
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>Senior Full-Stack Developer</h4>
                <p className="timeline-company">Tech Company | 2022 - Presente</p>
                <p>
                  Desarrollo de aplicaciones empresariales utilizando React, Node.js y
                  microservicios. Implementación de arquitecturas escalables y sistemas
                  distribuidos.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>Full-Stack Developer</h4>
                <p className="timeline-company">Startup Tech | 2020 - 2022</p>
                <p>
                  Desarrollo de MVP y productos desde cero. Trabajo con equipos ágiles y
                  metodologías modernas de desarrollo.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>Junior Developer</h4>
                <p className="timeline-company">Software Agency | 2019 - 2020</p>
                <p>
                  Desarrollo frontend y backend de aplicaciones web. Aprendizaje de mejores
                  prácticas y trabajo en equipo.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Educación">
        <div className="education-item">
          <h4>Ingeniería en Sistemas Computacionales</h4>
          <p className="education-institution">Universidad Tecnológica | 2015 - 2019</p>
          <p>Especialización en desarrollo de software y sistemas distribuidos.</p>
        </div>
      </Card>
    </div>
  );
};

export default About;
