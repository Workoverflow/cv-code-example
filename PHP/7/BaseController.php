<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Encoder\JsonDecode;
use Symfony\Component\Serializer\Encoder\JsonEncode;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Normalizer\PropertyNormalizer;
use Symfony\Component\Serializer\Serializer;

abstract class BaseController extends AbstractController
{

    /**
     * Success status
     */
    private const SUCCESS_STATUS = 'success';

    /**
     * Error status
     */
    private const ERROR_STATUS = 'error';

    /**
     * Send success response
     *
     * @param mixed $data
     * @param bool $optimize
     * @return JsonResponse
     */
    public function success($data = null, $optimize = false)
    {
       return $this->send(
           self::SUCCESS_STATUS,
           '',
           $data,
           $optimize
       );
    }

    /**
     * Send error response
     *
     * @param string|null $message
     * @param null $data
     * @return JsonResponse
     */
    public function error(
        ?string $message = 'Ошибка: невозможно обработать запрос',
        $data = null
    ) {
        return $this->send(
            self::ERROR_STATUS,
            $message,
            $data
        );
    }

    /**
     * Send response
     *
     * @param string $status - response status
     * @param string $message - error/success message
     * @param null $data - array/object data
     * @param bool $optimize - minify response, use ID of relatives objects
     * @param int $code - set response HTTP code
     *
     * @return JsonResponse
     */
    private function send(
        string $status,
        string $message = '',
        $data = null,
        $optimize = false,
        int $code = Response::HTTP_OK
    ) {
        $response = [
            'status' => $status,
            'message' => $message
        ];

        if ($data) {
            $response['data'] = $data;
        }

        return new JsonResponse(
            $this->responseOptimizer($response, $optimize),
            Response::HTTP_OK,
            [],
            true
        );
    }
    /**
     * Optimize json response
     *
     * @param $response
     * @return string
     */
    private function responseOptimizer($response, $optimize) {
        $serializer = new Serializer(
            [new PropertyNormalizer(), new ObjectNormalizer()],
            [new JsonEncoder(new JsonEncode([JSON_UNESCAPED_UNICODE]), new JsonDecode([]))]
        );
        $callbacks = [];

        if ($optimize) {
            $propertyMinify = function ($innerObject, $outerObject, string $attributeName, string $format = null, array $context = []) {
                return $innerObject->getId();
            };

            $callbacks = [
                AbstractNormalizer::CALLBACKS => [
                    'user' => $propertyMinify,
                    'car' => $propertyMinify,
                    'depot' => $propertyMinify
                ]
            ];
        }

        return $serializer->serialize($response, JsonEncoder::FORMAT, $callbacks);
    }
}