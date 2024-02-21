`uniform float Ka = 1;   // Ambient reflection coefficient
        uniform float Kd = 1;   // Diffuse reflection coefficient
        uniform float Ks = 1;   // Specular reflection coefficient
        uniform float shininessVal = 3; // Shininess
        // Material color
        uniform vec3 ambientColor = vec3(0.2, 0.09, 0);
        uniform vec3 diffuseColor = vec3(0.8, 0.4, 0);
        uniform vec3 specularColor = vec3(1, 1, 1);
        uniform vec3 lightPos = vec3(0.1 , 0.1, -0.11); // Light position
        varying vec4 color; //color
        
        void main(){
            vec4 vertPos4 = matrix * vec4(position, 1.0);
            vec3 vertPos = vec3(vertPos4) / vertPos4.w;
            vec3 normalInterp = vec3(normalMatrix * vec4(normal, 0.0));            
            gl_Position = projection * vertPos4;
            
            vec3 N = normalize(normalInterp);
            vec3 L = normalize(lightPos - vertPos);
            // Lambert's cosine law
            float lambertian = max(dot(N, L), 0.0);
            float specular = 0.0;
            if(lambertian > 0.0) {
                vec3 R = reflect(-L, N);      // Reflected light vector
                vec3 V = normalize(-vertPos); // Vector to viewer
                // Compute the specular term
                float specAngle = max(dot(R, V), 0.0);
                specular = pow(specAngle, shininessVal);
        }
        color = vec4(Ka * ambientColor +
                    Kd * lambertian * diffuseColor +
                    Ks * specular * specularColor, 1.0);
                    `